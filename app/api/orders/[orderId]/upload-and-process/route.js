import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
import { put } from '@/lib/storage'; // Assuming storage helper is here
import { POST as transformHandler } from '@/app/api/transform/route';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { stripe } from "@/lib/stripe"; // Import stripe to verify payment intent

// Helper to trigger transformation (copied from payment-complete route for consistency)
const triggerTransform = async (orderId, imageId) => {
  console.log(`Triggering transformation for order ${orderId}, image ${imageId}`);
  try {
     const transformRequest = new Request('https://internal-api/transform', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ 
         orderId, 
         imageId,
         isSystemCall: true
       }),
     });
     transformHandler(transformRequest).catch(error => {
       console.error(`Failed to trigger transform for image ${imageId}:`, error);
     });
  } catch (error) {
     console.error(`Failed to trigger transform for image ${imageId}:`, error);
  }
};

/**
 * API Endpoint to Upload Files After Payment and Trigger Processing
 * 
 * Receives files via FormData, uploads them to storage,
 * updates the order with image URLs, sets status to 'processing',
 * and triggers the transformation process.
 */
export async function POST(req, context) {
  try {
    await dbConnect();
    // Await context.params before accessing orderId
    const { orderId } = await Promise.resolve(context.params); 

    // Check if orderId is actually retrieved
    if (!orderId) {
        console.error('Failed to retrieve orderId from route parameters.');
        return NextResponse.json({ error: 'Missing order ID in request path' }, { status: 400 });
    }

    // 1. Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Find Order and Verify Ownership & Status
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }
    
    // -- Verification: Ensure order is paid or payment intent succeeded --
    // Option A: Check internal flag (relies on webhook working first)
    // if (!order.isPaid || order.paymentStatus !== 'completed') {
    //    console.warn(`Upload attempt for unpaid/pending order ${orderId}. Status: ${order.paymentStatus}`);
    //    return NextResponse.json({ error: 'Order payment not confirmed' }, { status: 402 }); // Payment Required
    // }
    
    // Option B: Verify PaymentIntent directly with Stripe (more robust if webhook is delayed)
    if (!order.paymentIntentId) {
        console.error(`Order ${orderId} is missing PaymentIntentId.`);
        return NextResponse.json({ error: 'Payment information incomplete for order' }, { status: 400 });
    }
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            console.warn(`Upload attempt for order ${orderId} but PaymentIntent status is ${paymentIntent.status}`);
            return NextResponse.json({ error: `Payment not completed (status: ${paymentIntent.status})` }, { status: 402 });
        }
        // Optionally update order flags if webhook was somehow missed
        if (!order.isPaid) {
             order.isPaid = true;
             order.paidAt = new Date();
             order.paymentStatus = 'completed';
             console.log(`Order ${orderId} flags updated based on PaymentIntent status.`);
        }
    } catch (stripeError) {
        console.error(`Stripe API error verifying PaymentIntent ${order.paymentIntentId} for order ${orderId}:`, stripeError);
        return NextResponse.json({ error: 'Failed to verify payment status' }, { status: 500 });
    }
    // -- End Verification --

    // 3. Process Uploaded Files
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error('Form data parsing error:', formError);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    // 4. Upload Files to Blob Storage & Update Order Images
    const uploadErrors = [];
    const imageUpdateMap = new Map(); // Map original filename to blob URL

    for (const file of files) {
      if (!file.name || !file.type.startsWith('image/')) {
        uploadErrors.push(`File "${file.name}" is not a valid image`);
        continue;
      }
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      try {
        const blob = await put(`originals/${fileName}`, file, {
          access: 'public',
          contentType: file.type,
        });
        // Use the original filename provided by the browser as the key
        imageUpdateMap.set(file.name, { 
            originalImage: fileName, // Keep stored filename unique 
            originalImageUrl: blob.url 
        }); 
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        uploadErrors.push(`Failed to upload "${file.name}": ${uploadError.message}`);
      }
    }

    // Update the order.images array
    let updatedImageCount = 0;
    order.images.forEach(img => {
      if (imageUpdateMap.has(img.name)) {
        const updateData = imageUpdateMap.get(img.name);
        img.originalImage = updateData.originalImage;
        img.originalImageUrl = updateData.originalImageUrl;
        // Set status back to pending before triggering transform?
        // Or rely on transform handler checking status?
        // Let's keep it as is, transform checks status.
        updatedImageCount++;
      } else {
         console.warn(`No uploaded file found matching image record name: ${img.name} in order ${orderId}`);
      }
    });

    if (updatedImageCount === 0 && files.length > 0) {
      const errorMsg = uploadErrors.length > 0
        ? `Upload failed for all images: ${uploadErrors.join(', ')}`
        : 'Mismatch between order image records and uploaded files';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    
    // Ensure at least one image was successfully linked
    if (updatedImageCount < files.length) {
       console.warn(`Order ${orderId}: Only ${updatedImageCount}/${files.length} uploaded files were matched to order records.`);
    }

    // 5. Update Order Status and Save
    order.status = 'processing';
    // Ensure payment flags are set (might be redundant if checked above, but safe)
    order.isPaid = true; 
    order.paymentStatus = 'completed';
    if (!order.paidAt) order.paidAt = new Date();
    
    const updatedOrder = await order.save();

    // 6. Trigger Transformations
    if (updatedOrder.images && updatedOrder.images.length > 0) {
      console.log(`Starting transform triggers for ${updatedOrder.images.length} images in order ${orderId} after upload...`);
      updatedOrder.images.forEach(image => {
        // Trigger only for images that now have a URL and haven't been processed
        if (image.originalImageUrl && image._id && !['completed', 'failed', 'processing'].includes(image.status)) {
          console.log(`Triggering transform for image ${image._id} (name: ${image.name})`);
          triggerTransform(updatedOrder._id.toString(), image._id.toString());
        } else {
          console.log(`Skipping trigger for image ${image._id} (name: ${image.name}): Status=${image.status}, URL_Exists=${!!image.originalImageUrl}`);
        }
      });
    }

    // 7. Return Success Response (include updated order)
    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${updatedImageCount} files and initiated processing.`,
      order: {
          id: updatedOrder._id,
          status: updatedOrder.status,
          images: updatedOrder.images.map(img => ({ // Return relevant image info
              id: img._id,
              name: img.name,
              originalImageUrl: img.originalImageUrl,
              status: img.status
          }))
      }
    });

  } catch (error) {
    console.error('Error uploading/processing paid files:', error);
    // Attempt to find orderId if context is available for error logging/status update
    const orderId = context?.params?.orderId;
    if (orderId) {
        try {
            const orderToFail = await Order.findById(orderId);
            if (orderToFail && orderToFail.status !== 'completed') {
                // Maybe set a specific error status?
                // For now, just log context.
                console.error(`Failed during post-payment upload/process for order ${orderId}`);
            }
        } catch (findError) { /* Ignore */} 
    }
    return NextResponse.json(
      { error: 'An error occurred while uploading/processing the files', details: error.message },
      { status: 500 }
    );
  }
}

// Configure API route config
export const config = {
  api: {
    bodyParser: false, // Required for FormData
  },
}; 