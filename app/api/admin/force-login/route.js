import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

// Direct token generation with hardcoded secret
const JWT_SECRET = '9XyBtJeAJ748Ssq9a4Df0V';
const generateTokenDirect = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Force login as admin - DEVELOPMENT ONLY
 * This endpoint is for debugging purposes and should be removed in production
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, secretKey } = await request.json();
    
    // Simple security check with a secret key
    if (secretKey !== JWT_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Make sure user is admin by setting it directly in database
    if (user.isAdmin !== true) {
      user.isAdmin = true;
      await user.save();
    }
    
    // Generate token
    const token = generateTokenDirect(user._id);
    
    // Create response with token in body
    const response = NextResponse.json({
      success: true,
      message: 'Force login successful',
      redirectUrl: '/admin/dashboard',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
    
    // Set the cookie directly in the response
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: false, // For development
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    return response;
  } catch {
    return NextResponse.json(
      { error: 'An error occurred during force login', message: error.message },
      { status: 500 }
    );
  }
} 