import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

// Helper to trigger transformation asynchronously
const triggerTransform = async (orderId, imageId) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const transformUrl = `${baseUrl}/api/transform`;
  console.log(`Triggering transformation for order ${orderId}, image ${imageId} at ${transformUrl}`);
  try {
    // No await here - fire and forget
    fetch(transformUrl, {
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
  } catch (error) {
    console.error(`Failed to trigger transform for image ${imageId}:`, error);
  }
};

// Helper to check admin status
async function getOrderAndCheckAdmin(orderId) {
  try {
    await dbConnect();
    
    // Get Clerk auth data
    const { userId } = await auth();
    
    if (!userId) {
      return { error: 'Authentication required', status: 401 };
    }
    
    // Find user and check admin status
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return { error: 'User not found', status: 404 };
    }
    
    if (!user.isAdmin) {
      return { error: 'Admin access required', status: 403 };
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return { error: 'Order not found', status: 404 };
    }
    
    return { order, user };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { error: 'Server error', status: 500 };
  }
}

/**
 * Bulk Transform Images API Endpoint (Admin Only)
 * 
 * POST: Trigger transformation for all untransformed images in an order
 */
export async function POST(req, context) {
  try {
    const { orderId } = context.params;
    const result = await getOrderAndCheckAdmin(orderId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    const { order } = result;
    
    // Parse optional filter parameters from request body
    const { filterStatus } = await req.json().catch(() => ({}));
    
    // Count of images to transform
    let transformCount = 0;
    let skippedCount = 0;
    
    // Trigger transformation for each image
    if (order.images && order.images.length > 0) {
      console.log(`Starting bulk transform for ${order.images.length} images in order ${orderId}...`);
      
      order.images.forEach(image => {
        const imageId = image._id.toString();
        const status = image.status || 'pending';
        
        // Filter by status if specified
        // Default behavior: process all images that aren't completed
        const shouldProcess = filterStatus 
          ? status === filterStatus
          : status !== 'completed';
        
        if (shouldProcess) {
          transformCount++;
          triggerTransform(orderId, imageId);
        } else {
          console.log(`Skipping image ${imageId} with status: ${status}`);
          skippedCount++;
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Initiated transform for ${transformCount} images (skipped ${skippedCount})`,
      orderId,
      transformCount,
      skippedCount
    });
  } catch (error) {
    console.error('Error in bulk transform:', error);
    return NextResponse.json(
      { error: 'Failed to initiate bulk transformation' },
      { status: 500 }
    );
  }
} 