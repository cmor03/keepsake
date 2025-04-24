import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import { generateToken, setTokenCookie } from '../../../../lib/auth';
import { sendWelcomeEmail } from '../../../../lib/email';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password, name } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Create a new user
    const user = await User.create({
      email,
      password,
      name: name || '',
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set cookie with token
    await setTokenCookie(token);
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {

      // Continue even if email fails
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {

    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
} 