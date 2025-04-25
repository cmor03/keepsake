import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { generateOrderNumber, calculatePrice } from '@/lib/utils';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from "@/lib/stripe"; // Import stripe

/**
 * API Endpoint to Initiate an Order (Placeholder)
 * 
 * Receives image metadata (count, names), creates an order document
 * with status 'awaiting_payment', calculates the price, and returns 
 * the orderId and amount needed for payment processing.
 * NO file upload happens here.
 */
export async function POST(req) {
  try {
    await dbConnect();

    // 1. Authentication & User Handling (similar to uploads route)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: 'Could not fetch user profile from Clerk' }, { status: 400 });
      }
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      if (!primaryEmail) {
        return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
      }
      user = await User.create({
        clerkId: userId,
        email: primaryEmail,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}` : 'Keepsake User'
      });
    }

    // 2. Get File Metadata from Request Body
    const { images } = await req.json(); // Expecting { images: [{ name: '...', ... }, ...] }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Image metadata is required' }, { status: 400 });
    }

    // 3. Prepare Image Data for Order (without URLs)
    const orderImages = images.map(img => ({
      name: img.name, // Store original filename
      // status will default to 'pending' via schema
      dateUploaded: new Date(), // Mark time of selection
      // originalImageUrl will be added LATER after successful payment & upload
    }));

    // 4. Calculate Price
    const totalAmount = calculatePrice(orderImages.length);

    // 5. Create Order Data
    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      user: user._id,
      customerEmail: user.email,
      images: orderImages, // Store metadata only
      totalAmount,
      status: 'awaiting_payment', // Set status explicitly
      paymentStatus: 'awaiting_payment',
      isPaid: false,
    };

    // 6. Create the Order in DB
    const order = await Order.create(orderData);

    // --- ADDED: Create Stripe Payment Intent --- 
    let paymentIntent;
    try {
        const amountInCents = Math.round(order.totalAmount * 100);
        
        // Optional: Create/find Stripe customer
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }, // Link Stripe customer to your user ID
            });
        }
        
        paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            customer: customer.id,
            receipt_email: user.email,
            metadata: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
            },
            description: `Keepsake photo processing order #${order.orderNumber}`,
        });
        
        // Save paymentIntentId AND clientSecret to the order
        order.paymentIntentId = paymentIntent.id;
        order.paymentIntentClientSecret = paymentIntent.client_secret;
        await order.save();
        
    } catch (stripeError) {
        console.error('Stripe PaymentIntent creation failed:', stripeError);
        // Rollback order creation? Or leave it as awaiting_payment?
        // Leaving it for now, but consider cleanup logic.
        return NextResponse.json({ error: 'Failed to initialize payment', details: stripeError.message }, { status: 500 });
    }
    // --- END ADDITION ---

    // 7. Return necessary info for payment step
    return NextResponse.json({
      success: true,
      orderId: order._id,
      amount: order.totalAmount,
      amountInCents: Math.round(order.totalAmount * 100),
      clientSecret: paymentIntent.client_secret, // Include client secret
    });

  } catch (error) {
    console.error('Error initiating order:', error);
    // Check for specific validation errors (e.g., duplicate order number)
    if (error.code === 11000) {
       return NextResponse.json({ error: 'Failed to generate unique order number. Please try again.' }, { status: 500 });
    }
    if (error.name === 'ValidationError') {
        return NextResponse.json({ error: `Order data validation failed: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An error occurred while initiating the order', details: error.message },
      { status: 500 }
    );
  }
} 