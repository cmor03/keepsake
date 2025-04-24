import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

// This endpoint syncs user data from Clerk to our MongoDB
export async function POST() {
  try {
    await dbConnect();
    
    // Get Clerk auth data
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get the full user profile from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Could not fetch user data from Clerk' },
        { status: 404 }
      );
    }
    
    // Find the user in our MongoDB
    let user = await User.findOne({ clerkId: userId });
    
    // If user doesn't exist, create a new one with Clerk data
    if (!user) {
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
    } else {
      // Update existing user with latest Clerk data
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
      
      // Only update if we have valid data to update with
      const updates = {};
      
      if (primaryEmail) {
        updates.email = primaryEmail;
      }
      
      if (clerkUser.firstName) {
        updates.name = `${clerkUser.firstName} ${clerkUser.lastName || ''}`;
      }
      
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
        // Reload user with updated data
        user = await User.findById(user._id);
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      }
    });
  } catch {
    console.error("Error syncing user data:", error);
    return NextResponse.json(
      { error: 'An error occurred while syncing user data', message: error.message },
      { status: 500 }
    );
  }
} 