import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Order from '../../../models/Order';
import { generateOrderNumber, calculatePrice } from '../../../lib/utils';
import { sendOrderConfirmationEmail } from '../../../lib/email';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { auth, currentUser } from '@clerk/nextjs/server';
import { put } from '../../../lib/storage';

// Don't try to access the local filesystem in production
// const uploadDir = path.join(process.cwd(), 'uploads', 'originals');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

export async function POST(req) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get authenticated user - required for uploads
    const { userId } = await auth();
    
    // If no user ID, return unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to upload images' },
        { status: 401 }
      );
    }
    
    // Find user in database
    let user = await User.findOne({ clerkId: userId });
    
    // If user doesn't exist in MongoDB, create a new one with Clerk data
    if (!user) {
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json(
          { error: 'Could not fetch user profile from Clerk' },
          { status: 400 }
        );
      }
      
      // Extract primary email if available
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      
      if (!primaryEmail) {
        return NextResponse.json(
          { error: 'Email address is required. Please add an email to your account.' },
          { status: 400 }
        );
      }
      
      // Create new user in our database
      user = await User.create({
        clerkId: userId,
        email: primaryEmail,
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`
          : 'Keepsake User'
      });
      
      console.log('Created new user in MongoDB:', user._id);
    }
    
    // Handle multipart form data
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error('Form data parsing error:', formError);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }
    
    // Save files and create order
    const orderImages = [];
    const uploadErrors = [];
    
    for (const file of files) {
      if (!file.name || !file.type.startsWith('image/')) {
        uploadErrors.push(`File "${file.name}" is not a valid image`);
        continue;
      }
      
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      
      try {
        // Upload file using our storage module
        const blob = await put(`originals/${fileName}`, file, {
          access: 'public',
          contentType: file.type,
        });
        
        // Add image to order - store the URL returned from Blob Storage
        orderImages.push({
          originalImage: fileName, // Still store just the filename for compatibility
          name: file.name,
          originalImageUrl: blob.url, // Store the actual blob URL
          dateUploaded: new Date(),
        });
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        uploadErrors.push(`Failed to upload "${file.name}": ${uploadError.message}`);
        // Continue with next file
      }
    }
    
    if (orderImages.length === 0) {
      const errorMsg = uploadErrors.length > 0
        ? `Upload failed: ${uploadErrors.join(', ')}`
        : 'No valid images uploaded';
      
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    
    // Calculate price
    const totalAmount = calculatePrice(orderImages.length);
    
    // Create a new order
    const orderNumber = generateOrderNumber();
    
    // Create order data
    const orderData = {
      orderNumber,
      images: orderImages,
      totalAmount,
      status: 'awaiting_payment',
      customerEmail: user.email,
      user: user._id, // Always associate with authenticated user
    };
    
    // Create the order
    let order;
    try {
      order = await Order.create(orderData);
    } catch (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ 
        error: 'Failed to create order. Please try again.' 
      }, { status: 500 });
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
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during file upload', details: error.message },
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