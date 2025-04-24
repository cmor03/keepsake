import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Order from '../../../../models/Order';
import { retrievePaymentIntent } from '../../../../lib/stripe';
import { sendOrderConfirmationEmail } from '../../../../lib/email';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * API endpoint to confirm a payment and update the order
 * This is called after a payment is successfully processed by Stripe
 */
export async function POST(request) {
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
    
    // Get payment intent ID from request
    const { paymentIntentId } = await request.json();
    
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }
    
    // Retrieve the payment intent from Stripe to confirm it's successful
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ 
        error: 'Payment has not been completed', 
        paymentStatus: paymentIntent.status 
      }, { status: 400 });
    }
    
    // Get order ID from payment intent metadata
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID not found in payment metadata' }, { status: 400 });
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
    
    // Update order status
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'processing'; // Move from pending to processing
    order.paymentStatus = 'completed';
    
    await order.save();
    
    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(
        order.customerEmail || user.email,
        order.orderNumber,
        order.images.length,
        order.finalAmount || order.totalAmount
      );
    } catch {
      console.error('Failed to send confirmation email:', emailError);
      // Continue even if email fails
    }
    
    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paidAt: order.paidAt
      }
    });
  } catch {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while confirming payment' },
      { status: 500 }
    );
  }
} 