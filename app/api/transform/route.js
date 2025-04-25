import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Order from '../../../models/Order';
import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { auth, currentUser } from '@clerk/nextjs/server';

// Configure directories
const originalsDir = path.join(process.cwd(), 'uploads', 'originals');
const transformedDir = path.join(process.cwd(), 'uploads', 'transformed');

// Ensure directories exist
if (!fs.existsSync(transformedDir)) {
  fs.mkdirSync(transformedDir, { recursive: true });
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
    
    // Check if image has already been transformed
    if (imageToTransform.transformedImage) {
      return NextResponse.json({
        success: true,
        message: 'Image already transformed',
        image: {
          id: imageToTransform._id,
          originalImage: imageToTransform.originalImage,
          transformedImage: imageToTransform.transformedImage,
          dateTransformed: imageToTransform.dateTransformed
        }
      });
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Prepare file for OpenAI
    const originalImagePath = path.join(originalsDir, imageToTransform.originalImage);
    if (!fs.existsSync(originalImagePath)) {
      return NextResponse.json({ error: 'Original image file not found' }, { status: 404 });
    }
    
    // Create readable stream for the image
    const imageStream = fs.createReadStream(originalImagePath);
    
    // Use the toFile helper, explicitly setting the type to PNG
    const imageFile = await toFile(imageStream, imageToTransform.originalImage, {
      type: "image/png",
    });
    
    // Call OpenAI API for image transformation
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: [imageFile],
      prompt: "Transform this real-life image into a beautiful coloring book style image with clear black outlines and white background, perfect for coloring. Pay close attention to the number and position of windows, doors, awnings, and more. ",
    });
    
    // Save the transformed image
    if (response.data && response.data[0].b64_json) {
      const transformedFileName = `${uuidv4()}.png`;
      const transformedImagePath = path.join(transformedDir, transformedFileName);
      
      // Decode base64 and save to file
      const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
      fs.writeFileSync(transformedImagePath, imageBuffer);
      
      // Update the database record
      imageToTransform.transformedImage = transformedFileName;
      imageToTransform.dateTransformed = new Date();
      await order.save();
      
      return NextResponse.json({
        success: true,
        image: {
          id: imageToTransform._id,
          originalImage: imageToTransform.originalImage,
          transformedImage: transformedFileName,
          dateTransformed: imageToTransform.dateTransformed
        }
      });
    } else {
      return NextResponse.json({ error: 'Failed to transform image' }, { status: 500 });
    }
  } catch {
    console.error('Transform error:', error);
    return NextResponse.json(
      { error: 'An error occurred during image transformation' },
      { status: 500 }
    );
  }
} 