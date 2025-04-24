import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Order from '../../../../models/Order';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    await dbConnect();
    
    // Get Clerk auth data
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get the full user profile from Clerk to ensure we have the email
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Could not fetch user data from Clerk' },
        { status: 404 }
      );
    }
    
    // Extract primary email from Clerk
    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;
    
    if (!primaryEmail) {
      return NextResponse.json(
        { error: 'No email address found in your profile' },
        { status: 400 }
      );
    }
    
    // Find or create user in MongoDB
    let user = await User.findOne({ clerkId: userId });
    
    // If user doesn't exist in MongoDB, create a new one with Clerk data
    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: primaryEmail,
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`
          : 'Keepsake User'
      });
    }
    
    // Update user email if it doesn't match Clerk's primary email
    if (user.email !== primaryEmail) {
      user.email = primaryEmail;
      await user.save();
    }
    
    // Parse request body
    const body = await req.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Find order by ID
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if the order belongs to the user
    if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Update the order with the user's email from Clerk
    order.customerEmail = primaryEmail;
    await order.save();
    
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail
      }
    });
  } catch {
    console.error('Fix email error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the order' },
      { status: 500 }
    );
  }
} 