import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { stripe } from "@/lib/stripe";
import { POST as transformHandler } from "@/app/api/transform/route";

// Helper to trigger transformation asynchronously
// Use direct import method instead of fetch for internal API calls
const triggerTransform = async (orderId, imageId) => {
  console.log(`Triggering transformation for order ${orderId}, image ${imageId}`);
  try {
     // Create a new Request object for the transform API
     const transformRequest = new Request('https://internal-api/transform', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ 
         orderId, 
         imageId,
         isSystemCall: true  // Flag to bypass user auth check
       }),
     });
     
     // Call the handler directly
     transformHandler(transformRequest).catch(error => {
       console.error(`Failed to trigger transform for image ${imageId}:`, error);
     });
  } catch (error) {
     console.error(`Failed to trigger transform for image ${imageId}:`, error);
  }
};

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

    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment has not been completed" },
        { status: 400 }
      );
    }

    // Find and update the order in one step, returning the updated document
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "processing", // Set status to processing, not completed yet
        paymentStatus: "completed",
        isPaid: true,
        paidAt: new Date(),
        paymentIntentId,
      },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found after update attempt" },
        { status: 404 }
      );
    }
    
    console.log(`Order ${orderId} payment confirmed, status set to processing.`);

    // Trigger transformation for each image asynchronously
    if (updatedOrder.images && updatedOrder.images.length > 0) {
        console.log(`Starting transform triggers for ${updatedOrder.images.length} images in order ${orderId}...`);
        updatedOrder.images.forEach(image => {
            // Only trigger for images that haven't been processed yet
            if (image.status === 'pending' && image._id) { 
                triggerTransform(updatedOrder._id.toString(), image._id.toString());
            } else {
                console.log(`Skipping trigger for image ${image._id} with status ${image.status}`);
            }
        });
    }

    // Return success immediately, transformation happens in background
    return NextResponse.json({ success: true, orderStatus: updatedOrder.status });
  } catch (error) {
    console.error("Error completing payment:", error);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
} 