import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Order from '../../../models/Order';
import User from '../../../models/User';

export async function ensureOrderHasEmail(req, context, next) {
  await dbConnect();
  
  const response = await next();
  
  // Clone the response to modify it
  const data = await response.json();
  
  if (data.order && !data.order.customerEmail) {
    try {
      // Find the order in the database
      const order = await Order.findById(data.order.id);
      
      if (!order.customerEmail && order.user) {
        // Find the user to get their email
        const user = await User.findById(order.user);
        
        if (user && user.email) {
          // Update the order with the user's email
          order.customerEmail = user.email;
          await order.save();
          
          // Update the response data
          data.order.customerEmail = user.email;
        }
      }
      
      // Return modified response
      return NextResponse.json(data, {
        status: response.status,
        headers: response.headers
      });
    } catch {
      console.error('Error in email middleware:', error);
    }
  }
  
  // Return original response if no modifications needed
  return response;
} 