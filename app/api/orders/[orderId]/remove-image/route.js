import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import User from '../../../../../models/User';
import Order from '../../../../../models/Order';
import { auth, currentUser } from '@clerk/nextjs/server';
import { calculatePrice } from '../../../../../lib/utils';

export async function POST(req, context) {
  try {
    // Extract the orderId from context.params
    const { orderId } = await context.params;
    
    const data = await req.json();
    const { imageId } = data;

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

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
      console.log('User not found in MongoDB, creating from Clerk data...');
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
      
      user = await User.create({
        clerkId: userId,
        email: primaryEmail || userId, // Use primary email or fallback to Clerk ID
        name: clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`
          : 'Keepsake User'
      });
      
      console.log('Created new user in MongoDB:', user._id);
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the order belongs to the user or user is admin
    if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to modify this order' },
        { status: 403 }
      );
    }

    // Check if the order status is 'pending'
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending orders can be modified' },
        { status: 400 }
      );
    }

    // Find the image in the order's images array
    const imageIndex = order.images.findIndex(img => 
      img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return NextResponse.json(
        { error: 'Image not found in this order' },
        { status: 404 }
      );
    }

    // Remove the image from the array
    order.images.splice(imageIndex, 1);
    
    // Recalculate the total amount
    order.totalAmount = calculatePrice(order.images.length);
    
    // Save the updated order
    await order.save();

    return NextResponse.json({ 
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        imageCount: order.images.length,
        totalAmount: order.totalAmount,
      } 
    });
  } catch (error) {
    console.error('Error removing image:', error);
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 }
    );
  }
} 