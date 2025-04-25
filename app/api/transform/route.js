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

/**
 * Image Transformation API Endpoint
 * 
 * This endpoint processes a single image at a time, transforming it into a coloring book style image.
 * For orders with multiple images, parallelization happens at a higher level:
 * 
 * 1. When payment is complete, the /api/orders/[orderId]/payment-complete/route.js endpoint
 *    triggers this transformation endpoint for each image in the order in parallel.
 * 2. Each image is processed independently in its own request.
 * 3. This design allows for efficient parallel processing of multiple images without
 *    overloading the server with a single large request.
 */

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
    
    // Parse request body early to check for system call flag
    const body = await req.json();
    const { orderId, imageId, isSystemCall } = body;
    
    // Skip auth check for system calls but require valid order and image IDs
    if (!isSystemCall) {
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
    }
    
    if (!orderId || !imageId) {
      return NextResponse.json({ error: 'Order ID and Image ID are required' }, { status: 400 });
    }
    
    // Find order and image
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Skip permission check for system calls
    if (!isSystemCall) {
      // Find user by Clerk ID (we know it exists from above)
      const user = await User.findOne({ clerkId: (await auth()).userId });
      
      // Check if user owns this order or is admin
      if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
      }
    }
    
    // Find the specific image in the order
    const imageIndex = order.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return NextResponse.json({ error: 'Image not found in order' }, { status: 404 });
    }
    const imageToTransform = order.images[imageIndex];
    
    // Check if already completed or failed
    if (imageToTransform.status === 'completed' || imageToTransform.status === 'failed') {
       console.log(`Image ${imageId} already has status ${imageToTransform.status}. Skipping.`)
       // Return existing data if completed
       if (imageToTransform.transformedImageUrl) { 
          return NextResponse.json({
            success: true,
            message: `Image already processed with status: ${imageToTransform.status}`,
            image: {
              id: imageToTransform._id,
              originalImageUrl: imageToTransform.originalImageUrl,
              transformedImageUrl: imageToTransform.transformedImageUrl,
              dateTransformed: imageToTransform.dateTransformed,
              status: imageToTransform.status
            }
          });
       } else {
         // If failed or completed without URL (shouldn't happen), just acknowledge
          return NextResponse.json({ success: true, message: `Image status is ${imageToTransform.status}. No action taken.` });
       }
    }
    
    // --- ADDED: Update status to processing immediately --- 
    if (imageToTransform.status !== 'processing') { 
      try {
        console.log(`Updating image ${imageId} status to processing...`);
        // Update directly in the found order object
        order.images[imageIndex].status = 'processing';
        // Save the change to the database
        await order.save();
        console.log(`Image ${imageId} status updated to processing.`);
      } catch(statusUpdateError) {
         console.error(`Failed to update image ${imageId} status to processing:`, statusUpdateError);
         // Proceed anyway? Or return error? Let's return an error for now.
         return NextResponse.json({ error: 'Failed to update image status before processing' }, { status: 500 });
      }
    } else {
        console.log(`Image ${imageId} is already processing. Proceeding with transform attempt.`);
    }
    // --- End Status Update --- 

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
    
    // --- ADDED: Log before OpenAI call --- 
    console.log(`[Order: ${orderId}, Image: ${imageId}] Attempting to call OpenAI image transformation...`);
    // --- End Log --- 

    // Call OpenAI API for image transformation using GPT-Image-1
    let openAIResponse;
    try {
      // Use the edit method with the uploaded image and a specific prompt for houses
      console.log('Transforming image with GPT-Image-1 edit method...');
      openAIResponse = await openai.images.edit({ 
        model: "gpt-image-1",
        image: imageFile, // Use the file prepared from blob data
        prompt: "Transform this house image into a beautiful coloring book style drawing with clear black outlines and white background. Preserve accurate architectural details including all windows, doors, awnings, and structural elements of the house. Make it perfect for coloring while maintaining the original layout and character of the building.",
        n: 1,
        size: "1024x1536",
        quality: "high"
      });
    } catch (apiError) {
      console.error('Error with GPT-Image-1 edit:', apiError.message);
      // No fallback, just fail the operation
      imageToTransform.status = 'failed';
      await order.save();
      return NextResponse.json({ 
        error: `Failed to transform image: ${apiError.message}` 
      }, { status: 500 });
    }
    
    // --- MODIFIED: Save transformed image to Blob storage --- 
    if (openAIResponse && openAIResponse.data && openAIResponse.data[0]) {
      // Check if response has b64_json (base64 encoded image)
      if (openAIResponse.data[0].b64_json) {
        console.log(`Received base64 encoded image from OpenAI`);
        
        // Convert base64 to buffer
        const base64Data = openAIResponse.data[0].b64_json;
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // Upload the buffer to Vercel Blob storage
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
      }
      // Fallback to URL response if it exists
      else if (openAIResponse.data[0].url) {
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
      }
      else {
        console.error('Failed to transform image: response missing both url and b64_json:', openAIResponse);
        // Update status to failed if transformation fails
        imageToTransform.status = 'failed';
        await order.save();
        return NextResponse.json({ error: 'Failed to transform image: invalid response format' }, { status: 500 });
      }
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
      // Use body variables which are accessible from the parent scope
      if (body && body.orderId && body.imageId) {
         const order = await Order.findById(body.orderId);
         if (order) {
            const imageToTransform = order.images.find(img => img._id.toString() === body.imageId);
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