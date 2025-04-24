import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Order from '../../../../models/Order';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(req, context) {
  try {
    // Extract the orderId from context.params - with proper await for params in Next.js App Router
    const { orderId } = await context.params;
    
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
    
    // Find order by ID
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the order belongs to the user or if user is admin
    if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        imageCount: order.images.length,
        totalAmount: order.totalAmount,
        finalAmount: order.finalAmount || order.totalAmount,
        customerEmail: order.customerEmail || user.email,
        images: order.images.map(img => ({
          id: img._id,
          originalImage: img.originalImage,
          transformedImage: img.transformedImage,
          name: img.name,
          dateUploaded: img.dateUploaded,
          dateTransformed: img.dateTransformed,
        })),
      },
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the order' },
      { status: 500 }
    );
  }
} 