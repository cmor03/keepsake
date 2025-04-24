import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Use exact secret from environment
const JWT_SECRET = '9XyBtJeAJ748Ssq9a4Df0V';

// Direct verification function to ensure consistent secret
const verifyTokenDirect = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export async function GET() {
  try {
    await dbConnect();
    
    // Get cookies directly from the request
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify token using direct method with hardcoded secret
    const decoded = verifyTokenDirect(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching user data', message: error.message },
      { status: 500 }
    );
  }
} 