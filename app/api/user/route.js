import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Order from '../../../models/Order';

export async function GET() {
  try {
    await dbConnect();
    
    // Get the Clerk user ID
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Find or create user in MongoDB
    let user = await User.findOne({ clerkId: userId });
    
    // If user doesn't exist, create a new one with their Clerk ID
    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: userId, // Temporary email - will be updated
        name: "Keepsake User" // Default name
      });
    }
    
    // Fetch user's orders
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        imageCount: order.images.length,
        totalAmount: order.totalAmount,
        images: order.images
          .filter(img => img.transformedImage || img.transformedImageUrl) // Include images with either transformedImage or URL
          .map(img => ({
            _id: img._id,
            originalImage: img.originalImage,
            originalImageUrl: img.originalImageUrl,
            transformedImage: img.transformedImage,
            transformedImageUrl: img.transformedImageUrl, // Include the blob URL
            name: img.name,
            dateUploaded: img.dateUploaded,
            dateTransformed: img.dateTransformed,
            status: img.status
          })),
      })),
    });
  } catch {
    console.error("Error in user API route:", error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data', message: error.message },
      { status: 500 }
    );
  }
} 