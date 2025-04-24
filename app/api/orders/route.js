import { NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken } from '../../../lib/auth';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Order from '../../../models/Order';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Get user ID from token
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const query = { user: user._id };
    
    // Add status to query if provided
    if (status) {
      query.status = status;
    }
    
    // Fetch user's orders
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        imageCount: order.images.length,
        totalAmount: order.totalAmount,
        images: order.images
          .filter(img => img.transformedImage) // Only include transformed images
          .map(img => ({
            id: img._id,
            originalImage: img.originalImage,
            transformedImage: img.transformedImage,
            name: img.name,
            dateUploaded: img.dateUploaded,
            dateTransformed: img.dateTransformed,
          })),
      })),
    });
  } catch (error) {

    return NextResponse.json(
      { error: 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
} 