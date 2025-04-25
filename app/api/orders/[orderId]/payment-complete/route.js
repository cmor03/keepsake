import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { stripe } from "@/lib/stripe";
import { POST as transformHandler } from "@/app/api/transform/route";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req, context) {
  try {
    await dbConnect();
    const { orderId } = await Promise.resolve(context.params);
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    // Check if already processed by this webhook or client-side upload
    if (order.isPaid && order.paymentStatus === 'completed') {
         console.log(`Webhook received for already paid order ${orderId}. Ignoring.`);
         return NextResponse.json({ success: true, message: `Order payment already confirmed.` });
    }
    
    // Allow processing if status is awaiting_payment OR processing (client might have started upload)
    if (!['awaiting_payment', 'processing'].includes(order.status)) {
        console.warn(`Webhook received for order ${orderId} with unexpected status: ${order.status}.`);
        return NextResponse.json(
            { error: `Order has unexpected status: ${order.status}` },
            { status: 400 }
        );
    }

    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      // Don't error out, just log. Maybe payment will succeed later?
      console.warn(`Webhook received for order ${orderId} but PaymentIntent status is ${paymentIntent.status}. No action taken.`);
      return NextResponse.json({ success: false, message: `Payment not completed (status: ${paymentIntent.status})` });
    }

    // --- Update Order: Only mark as paid --- 
    // Do NOT change order.status here - let the upload handler do that.
    order.paymentStatus = "completed";
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentIntentId = paymentIntentId;
    
    const updatedOrder = await order.save();
    console.log(`Order ${orderId} marked as paid via webhook.`);
    // --- End Update --- 

    // --- Send confirmation email (Still OK to do here) --- 
    try {
        if (updatedOrder.customerEmail && updatedOrder.orderNumber && updatedOrder.images) {
            await sendOrderConfirmationEmail(
                updatedOrder.customerEmail,
                updatedOrder.orderNumber,
                updatedOrder.images.length,
                updatedOrder.totalAmount
            );
            console.log(`Order confirmation email sent for order ${orderId}`);
        } else {
            console.error(`Cannot send confirmation email for order ${orderId}, missing required data.`);
        }
    } catch (emailError) {
        console.error(`Failed to send confirmation email for order ${orderId}:`, emailError.message);
    }
    // --- End Email --- 

    return NextResponse.json({ success: true, orderStatus: updatedOrder.status, paymentStatus: updatedOrder.paymentStatus });
  } catch (error) {
    console.error("Error completing payment:", error);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
} 