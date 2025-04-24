import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
    
    // Delete cookie directly in response
    response.cookies.delete('token');

    return response;
  } catch {

    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
} 