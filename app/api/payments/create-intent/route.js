import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Order from '../../../../models/Order';
import { createPaymentIntent, calculateOrderAmounts } from '../../../../lib/stripe';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * API endpoint to create a Stripe payment intent
 * This is called when a user proceeds to checkout
 */
export async function POST(request) {
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
    
    // Find user by Clerk ID
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
    
    // Get order ID from request
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Verify that the order belongs to the user
    if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }
    
    // Calculate the amounts including processing fee
    const { subtotal, fee, total } = calculateOrderAmounts(order.totalAmount);
    
    // Create metadata for the payment intent
    const metadata = {
      orderId: order._id.toString(),
      userId: user._id.toString(),
      orderNumber: order.orderNumber,
      imageCount: order.images.length,
      email: primaryEmail
    };
    
    // Create the payment intent
    const paymentIntent = await createPaymentIntent(total, metadata);
    
    // Update the order with payment intent ID and email from Clerk
    order.paymentIntentId = paymentIntent.id;
    order.processingFee = fee;
    order.finalAmount = total;
    order.customerEmail = primaryEmail;
    
    await order.save();
    
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        subtotal,
        processingFee: fee,
        total,
        customerEmail: primaryEmail
      }
    });
  } catch {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating payment intent', details: error.message },
      { status: 500 }
    );
  }
} 