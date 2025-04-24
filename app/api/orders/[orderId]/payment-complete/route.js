import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { stripe } from "@/lib/stripe";

export async function POST(req, context) {
  try {
    await dbConnect();
    // Properly await the params before destructuring
    const { orderId } = await context.params;
    
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment has not been completed" },
        { status: 400 }
      );
    }

    // Find the order using Mongoose
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status using Mongoose
    await Order.findByIdAndUpdate(orderId, {
      status: "completed",
      paymentStatus: "completed",
      isPaid: true,
      paidAt: new Date(),
      paymentIntentId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing payment:", error);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
} 