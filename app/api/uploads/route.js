import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Order from '../../../models/Order';
import { generateOrderNumber, calculatePrice } from '../../../lib/utils';
import { sendOrderConfirmationEmail } from '../../../lib/email';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { auth, currentUser } from '@clerk/nextjs/server';

// Configure file upload directory
const uploadDir = path.join(process.cwd(), 'uploads', 'originals');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req) {
  try {
    await dbConnect();
    
    // Get Clerk auth data instead of JWT token
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Find or create user in MongoDB
    let user = await User.findOne({ clerkId: userId });
    
    // If user doesn't exist in MongoDB, create a new one with Clerk data
    if (!user) {
      console.log('User not found in MongoDB, creating from Clerk data...');
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
      
      user = await User.create({
        clerkId: userId,
        email: primaryEmail || userId, // Use primary email or fallback to Clerk ID
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`
          : 'Keepsake User'
      });
      
      console.log('Created new user in MongoDB:', user._id);
    }
    
    // Handle multipart form data (simplified for demo)
    // In production, you'd want to use a proper multipart parser like formidable
    // But for this demo, we'll use a simplified approach
    const formData = await req.formData();
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }
    
    // Save files and create order
    const orderImages = [];
    
    for (const file of files) {
      if (!file.name || !file.type.startsWith('image/')) {
        continue;
      }
      
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Save the file
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      fs.writeFileSync(filePath, fileBuffer);
      
      // Add image to order
      orderImages.push({
        originalImage: fileName,
        name: file.name,
        dateUploaded: new Date(),
      });
    }
    
    if (orderImages.length === 0) {
      return NextResponse.json({ error: 'No valid images uploaded' }, { status: 400 });
    }
    
    // Calculate price
    const totalAmount = calculatePrice(orderImages.length);
    
    // Create a new order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      user: user._id,
      orderNumber,
      images: orderImages,
      totalAmount,
      status: 'pending',
      customerEmail: user.email,
    });
    
    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        user.email,
        orderNumber,
        orderImages.length,
        totalAmount
      );
    } catch {
      // Continue even if email fails
      console.error('Email sending failed:', error.message);
    }
    
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        imageCount: orderImages.length,
        totalAmount,
        customerEmail: user.email,
      },
    });
  } catch {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during file upload' },
      { status: 500 }
    );
  }
}

// Configure API route config
export const config = {
  api: {
    bodyParser: false,
  },
}; 