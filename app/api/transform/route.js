import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Order from '../../../models/Order';
import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { auth, currentUser } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { Readable } from 'stream';

// Configure directory for transformed images (originals are now in blob)
// const transformedDir = path.join(process.cwd(), 'uploads', 'transformed'); 

// Ensure transformed directory exists
// if (!fs.existsSync(transformedDir)) {
//   fs.mkdirSync(transformedDir, { recursive: true });
// }

// Helper function to convert web stream to Node.js stream
async function webStreamToNodeStream(webStream) {
  const reader = webStream.getReader();
  const nodeStream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(Buffer.from(value));
      }
    }
  });
  return nodeStream;
}

export async function POST(req) {
  try {
    await dbConnect();
    
    // Get Clerk auth data
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Find user by Clerk ID
    let user = await User.findOne({ clerkId: userId });
    
    // If user doesn't exist in MongoDB, create a new one with Clerk data
    if (!user) {
      // Get the full user profile from Clerk
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json(
          { error: 'Could not fetch user data from Clerk' },
          { status: 404 }
        );
      }
      
      // Extract primary email if available
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      
      if (!primaryEmail) {
        return NextResponse.json(
          { error: 'No email address found in your profile' },
          { status: 400 }
        );
      }
      
      user = await User.create({
        clerkId: userId,
        email: primaryEmail,
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`
          : 'Keepsake User'
      });
    }
    
    // Parse request body
    const body = await req.json();
    const { orderId, imageId } = body;
    
    if (!orderId || !imageId) {
      return NextResponse.json({ error: 'Order ID and Image ID are required' }, { status: 400 });
    }
    
    // Find order and image
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if user owns this order or is admin
    if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }
    
    // Find the specific image in the order
    const imageToTransform = order.images.find(img => img._id.toString() === imageId);
    if (!imageToTransform) {
      return NextResponse.json({ error: 'Image not found in order' }, { status: 404 });
    }
    
    // MODIFIED: Check for transformedImage URL (assuming it's stored in blob too)
    if (imageToTransform.transformedImageUrl) { 
      return NextResponse.json({
        success: true,
        message: 'Image already transformed',
        image: {
          id: imageToTransform._id,
          originalImageUrl: imageToTransform.originalImageUrl, // Send back URLs
          transformedImageUrl: imageToTransform.transformedImageUrl,
          dateTransformed: imageToTransform.dateTransformed
        }
      });
    }
    
    // Check if the original image URL exists
    if (!imageToTransform.originalImageUrl) {
        return NextResponse.json({ error: 'Original image URL not found for this image record.' }, { status: 404 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // --- MODIFIED: Fetch image from Blob URL instead of local file ---
    let imageFile;
    try {
      console.log(`Fetching original image from blob: ${imageToTransform.originalImageUrl}`);
      const response = await fetch(imageToTransform.originalImageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch original image from blob: ${response.statusText}`);
      }
      if (!response.body) {
         throw new Error('Response body is null when fetching original image.');
      }
      
      // Get content type, default if not available
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      // Use original filename if available, otherwise generate one
      const fileName = imageToTransform.originalImage || `original-${imageId}`; 

      // Convert the web stream to a Node.js stream for OpenAI's toFile
      const nodeStream = await webStreamToNodeStream(response.body);

      imageFile = await toFile(nodeStream, fileName, {
        type: contentType, // Use actual content type from blob
      });
      console.log(`Successfully prepared image file for OpenAI from blob.`);

    } catch (fetchError) {
       console.error('Error fetching or preparing image from blob:', fetchError);
       return NextResponse.json({ error: `Failed to process original image: ${fetchError.message}` }, { status: 500 });
    }
    // --- End Modification ---
    
    // Call OpenAI API for image transformation
    const openAIResponse = await openai.images.edit({
      model: "dall-e-2", // Check if this is the correct model for edits, or if you meant generation
      image: imageFile, // Use the file prepared from blob data
      prompt: "Transform this real-life image into a beautiful coloring book style image with clear black outlines and white background, perfect for coloring.",
      n: 1, // Generate one image
      size: "1024x1024" // Specify size if needed for edit model
    });
    
    // --- MODIFIED: Save transformed image to Blob storage --- 
    if (openAIResponse.data && openAIResponse.data[0].url) { // DALL-E 2 returns a URL
      const transformedImageUrlFromOpenAI = openAIResponse.data[0].url;
      console.log(`Received transformed image URL from OpenAI: ${transformedImageUrlFromOpenAI}`);

      // 1. Fetch the image data from OpenAI's URL
      const imageResponse = await fetch(transformedImageUrlFromOpenAI);
      if (!imageResponse.ok) {
         throw new Error(`Failed to fetch transformed image from OpenAI URL: ${imageResponse.statusText}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const fileBuffer = Buffer.from(imageBuffer);

      // 2. Upload the buffer to Vercel Blob storage
      const transformedFileName = `${uuidv4()}.png`; // Keep generating unique names
      const blob = await put(transformedFileName, fileBuffer, {
         access: 'public',
         contentType: 'image/png',
      });
      console.log(`Uploaded transformed image to blob: ${blob.url}`);

      // Update the database record with the Blob URL
      imageToTransform.transformedImage = transformedFileName; // Keep filename for reference?
      imageToTransform.transformedImageUrl = blob.url; // Store the actual blob URL
      imageToTransform.status = 'completed'; // Update status
      imageToTransform.dateTransformed = new Date();
      await order.save();
      
      return NextResponse.json({
        success: true,
        image: {
          id: imageToTransform._id,
          originalImageUrl: imageToTransform.originalImageUrl,
          transformedImageUrl: imageToTransform.transformedImageUrl,
          dateTransformed: imageToTransform.dateTransformed
        }
      });
    } else {
      console.error('Failed to transform image or invalid response from OpenAI:', openAIResponse);
      // Update status to failed if transformation fails
      imageToTransform.status = 'failed';
      await order.save();
      return NextResponse.json({ error: 'Failed to transform image' }, { status: 500 });
    }
  } catch (error) {
    console.error('Transform route error:', error);
    // Attempt to update status to failed even if other errors occur
    try {
      const body = await req.json(); // Need to re-parse or have it available
      const { orderId, imageId } = body;
      if (orderId && imageId) {
         const order = await Order.findById(orderId);
         if (order) {
            const imageToTransform = order.images.find(img => img._id.toString() === imageId);
            if (imageToTransform && imageToTransform.status !== 'completed') {
               imageToTransform.status = 'failed';
               await order.save();
            }
         }
      }
    } catch (updateError) {
       console.error('Failed to update image status to failed during error handling:', updateError);
    }

    return NextResponse.json(
      { error: `An error occurred during image transformation: ${error.message}` },
      { status: 500 }
    );
  }
} 