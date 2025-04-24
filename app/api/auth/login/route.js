import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

// Use exact secret from environment
const JWT_SECRET = '9XyBtJeAJ748Ssq9a4Df0V';

// Direct token generation to ensure consistent secrets
const generateTokenDirect = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate token using direct method with hardcoded secret
    const token = generateTokenDirect(user._id);
    
    // Set cookie directly in the response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
    
    // Set the cookie with primitive values to ensure compatibility
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: false, // Set to false for local development
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    return response;
  } catch {
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 