import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    // Get Clerk auth data
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get orderId from URL parameters
    const resolvedParams = await Promise.resolve(params); // Await the params
    const { orderId } = resolvedParams;                  // Destructure awaited params
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Find the user in your database
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order ownership
    if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }

    // --- Check if payment intent client_secret is stored on the order --- 
    // We need to ensure the /api/orders/initiate route saves this.
    // Assuming it's saved as 'paymentIntentClientSecret' on the Order model.
    if (!order.paymentIntentClientSecret) {
        console.error(`Order ${orderId} is missing the paymentIntentClientSecret.`);
        return NextResponse.json({ error: 'Payment details are incomplete for this order.' }, { status: 500 });
    }

    // Return the necessary payment details
    return NextResponse.json({
      success: true,
      clientSecret: order.paymentIntentClientSecret, 
      amount: order.totalAmount,
      imageCount: order.images.length, // Assuming images array reflects the count
    });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json(
      { error: `Failed to fetch payment details: ${error.message}` }, 
      { status: 500 }
    );
  }
} 