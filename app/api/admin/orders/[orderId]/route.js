import { NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken } from '../../../../../lib/auth';
import dbConnect from '../../../../../lib/db';
import User from '../../../../../models/User';
import Order from '../../../../../models/Order';
import { sendOrderCompletionEmail } from '../../../../../lib/email';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure upload directory for transformed images
const uploadDir = path.join(process.cwd(), 'uploads', 'transformed');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to get order and check admin permissions
async function getOrderAndCheckAdmin(id) {
  await dbConnect();
  
  // Get user ID from token
  const token = await getTokenFromCookie();
  if (!token) {
    return { error: 'Authentication required', status: 401 };
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }
  
  // Find user by ID and check if admin
  const user = await User.findById(decoded.userId);
  if (!user || !user.isAdmin) {
    return { error: 'Not authorized', status: 403 };
  }
  
  // Find order by ID
  const order = await Order.findById(id).populate('user', 'name email');
  if (!order) {
    return { error: 'Order not found', status: 404 };
  }
  
  return { user, order };
}

// Get order details
export async function GET(req, context) {
  try {
    const { orderId } = context.params;
    const result = await getOrderAndCheckAdmin(orderId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    const { order } = result;
    
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        imageCount: order.images.length,
        totalAmount: order.totalAmount,
        user: {
          id: order.user._id,
          name: order.user.name,
          email: order.user.email,
        },
        images: order.images.map(img => ({
          id: img._id,
          originalImage: img.originalImage,
          originalImageUrl: img.originalImageUrl,
          transformedImage: img.transformedImage,
          transformedImageUrl: img.transformedImageUrl,
          name: img.name,
          dateUploaded: img.dateUploaded,
          dateTransformed: img.dateTransformed,
          status: img.status
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while fetching the order' },
      { status: 500 }
    );
  }
}

// Update order status
export async function PATCH(req, context) {
  try {
    const { orderId } = context.params;
    const result = await getOrderAndCheckAdmin(orderId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    const { order } = result;
    const data = await req.json();
    
    // Update status if provided
    if (data.status) {
      order.status = data.status;
    }
    
    await order.save();
    
    // If the status is changed to completed, send an email notification
    if (data.status === 'completed' && !order.notificationSent) {
      // Only send if all images have transformedImage
      const allImagesTransformed = order.images.every(img => img.transformedImage);
      
      if (allImagesTransformed) {
        try {
          const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/orders/${order._id}`;
          await sendOrderCompletionEmail(order.user.email, order.orderNumber, orderUrl);
          
          order.notificationSent = true;
          await order.save();
        } catch {
          // Continue even if email fails
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while updating the order' },
      { status: 500 }
    );
  }
}

// Upload transformed images for an order
export async function POST(req, context) {
  try {
    const { orderId } = context.params;
    const result = await getOrderAndCheckAdmin(orderId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    const { order } = result;
    
    // Handle multipart form data
    const formData = await req.formData();
    const originalImageId = formData.get('originalImageId');
    const file = formData.get('file');
    
    if (!originalImageId || !file) {
      return NextResponse.json({ 
        error: 'Original image ID and transformed file are required' 
      }, { status: 400 });
    }
    
    // Find the image in the order
    const imageIndex = order.images.findIndex(img => 
      img._id.toString() === originalImageId
    );
    
    if (imageIndex === -1) {
      return NextResponse.json({ 
        error: 'Image not found in the order' 
      }, { status: 404 });
    }
    
    // Save the transformed image
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Write the file
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    fs.writeFileSync(filePath, fileBuffer);
    
    // Set up URL for the image
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/api/uploads/transformed/${fileName}`;
    
    // Update the image in the order
    order.images[imageIndex].transformedImage = fileName;
    order.images[imageIndex].transformedImageUrl = imageUrl;
    order.images[imageIndex].dateTransformed = new Date();
    order.images[imageIndex].status = 'completed';
    await order.save();
    
    // Check if all images in the order have been transformed
    const allImagesTransformed = order.images.every(img => 
      img.status === 'completed' || img.status === 'failed'
    );
    
    // If all transformed, update order status to completed
    if (allImagesTransformed) {
      // Set order status to completed when all images are processed
      order.status = 'completed';
      await order.save();
      console.log(`All images in order ${orderId} are processed. Order status updated to completed.`);
    }
    
    return NextResponse.json({
      success: true,
      image: {
        id: order.images[imageIndex]._id,
        originalImage: order.images[imageIndex].originalImage,
        originalImageUrl: order.images[imageIndex].originalImageUrl,
        transformedImage: order.images[imageIndex].transformedImage,
        transformedImageUrl: order.images[imageIndex].transformedImageUrl,
        dateTransformed: order.images[imageIndex].dateTransformed,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while uploading the transformed image' },
      { status: 500 }
    );
  }
} 