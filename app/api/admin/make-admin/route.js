import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

// Temporary endpoint to make a user an admin
// This should be secured or removed in production
export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, secretKey } = await request.json();
    
    // Simple security check with a secret key
    // In production, use a more secure method
    if (secretKey !== '9XyBtJeAJ748Ssq9a4Df0V') {
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
    
    // Check current admin status
    const wasAdmin = user.isAdmin === true;
    
    // Set user as admin explicitly with boolean true
    user.isAdmin = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: wasAdmin ? 'User was already an admin' : 'User is now an admin',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {

    return NextResponse.json(
      { error: 'An error occurred while making user an admin' },
      { status: 500 }
    );
  }
} 