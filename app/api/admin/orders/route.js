import { NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken } from '../../../../lib/auth';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Order from '../../../../models/Order';

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
    
    // Find user by ID and check if admin
    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const query = status ? { status } : {};
    
    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        imageCount: order.images.length,
        totalAmount: order.totalAmount,
        user: {
          id: order.user._id,
          name: order.user.name,
          email: order.user.email,
        },
        images: order.images.map(img => ({
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