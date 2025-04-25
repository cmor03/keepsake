import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Order from '../../../models/Order';

// Initialize Stripe with your secret key, with safeguards for missing API key
let stripe;
try {
  // Check if the API key is defined
  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    console.warn('STRIPE_SECRET_KEY environment variable is not set. Payment functionality will be unavailable.');
  } else {
    stripe = new Stripe(apiKey);
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

export async function POST(request) {
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      return NextResponse.json(
        { 
          error: 'Payment service is not configured. Please contact the administrator.',
          details: 'Stripe API key is missing. Set the STRIPE_SECRET_KEY environment variable.'
        }, 
        { status: 503 } // Service Unavailable
      );
    }

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
        { error: 'No email address found in your Clerk profile' },
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
    
    const body = await request.json();
    const { orderId, amount, images = [] } = body;
    
    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and amount are required' },
        { status: 400 }
      );
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
    
    // Update the order with the verified email from Clerk
    order.customerEmail = primaryEmail;
    await order.save();
    
    // Calculate amount in cents (Stripe uses the smallest currency unit)
    const amountInCents = Math.round(amount * 100);
    
    // Create a new customer or use existing one
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: primaryEmail,
      limit: 1,
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: primaryEmail,
        metadata: {
          orderId,
        },
      });
    }
    
    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customer.id,
      receipt_email: primaryEmail,
      metadata: {
        orderId,
        imageCount: images.length,
      },
      description: `Payment for photo processing order #${orderId}`,
    });
    
    // Return the client secret and other details
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
      amount,
      customerEmail: primaryEmail,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create payment intent',
        code: error.code || 'unknown_error'
      },
      { status: 500 }
    );
  }
} 