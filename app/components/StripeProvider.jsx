'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Create a context for Stripe-related functions
export const StripeContext = createContext();

export const useStripe = () => useContext(StripeContext);

export default function StripeProvider({ children }) {
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // Create a payment intent on the server
  const createPaymentIntent = useCallback(async (orderData) => {
    setProcessing(true);
    setPaymentError(null);
    
    try {
      // Check required fields before sending to the API
      if (!orderData.orderId) {
        throw new Error('Order ID is required to create a payment');
      }
      
      if (!orderData.amount) {
        throw new Error('Payment amount is required');
      }
      
      if (!orderData.customerEmail) {
        throw new Error('Customer email is required');
      }
      
      // Ensure we have the images array, even if empty
      if (!orderData.images) {
        orderData.images = [];
      }
      
      console.log('Creating payment intent with data:', {
        orderId: orderData.orderId,
        amount: orderData.amount,
        customerEmail: orderData.customerEmail,
        imageCount: orderData.images.length
      });
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Payment intent creation failed:', data.error);
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
      setPaymentIntent(data);
      return data;
    } catch (error) {
      console.error('Payment intent error:', error);
      setPaymentError(error.message || 'Failed to set up payment. Please try again.');
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);
  
  // Confirm payment with Stripe
  const confirmPayment = useCallback(async (stripe, elements, clientSecret, orderDetails) => {
    setProcessing(true);
    setPaymentError(null);
    
    try {
      if (!stripe || !elements || !clientSecret) {
        throw new Error('Stripe has not been properly initialized');
      }
      
      const cardElement = elements.getElement('card');
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: orderDetails.customerEmail,
          },
        },
        receipt_email: orderDetails.customerEmail,
      });
      
      if (error) {
        console.error('Stripe payment confirmation error:', error);
        throw new Error(error.message || 'Payment failed. Please try again.');
      }
      
      return paymentIntent;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);
  
  // Update an order after payment
  const updateOrderAfterPayment = useCallback(async (orderId, paymentIntentId) => {
    try {
      if (!orderId || !paymentIntentId) {
        throw new Error('Missing order ID or payment intent ID');
      }
      
      const response = await fetch(`/api/orders/${orderId}/payment-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Order update after payment failed:', data.error);
        throw new Error(data.error || 'Failed to update order status');
      }
      
      return data;
    } catch (error) {
      console.error('Update order error:', error);
      throw error;
    }
  }, []);
  
  // Check if Stripe is available
  const isStripeAvailable = !!stripePromise;
  
  // If Stripe is not available, set an error
  if (!isStripeAvailable && typeof window !== 'undefined') {
    console.error('Stripe publishable key is missing. Payment functionality will be unavailable.');
  }
  
  const contextValue = {
    paymentIntent,
    processing,
    paymentError,
    createPaymentIntent,
    confirmPayment,
    updateOrderAfterPayment,
    isStripeAvailable,
  };
  
  // If Stripe is not initialized, still render children but don't wrap in Elements
  if (!stripePromise) {
    return (
      <StripeContext.Provider value={contextValue}>
        {children}
      </StripeContext.Provider>
    );
  }
  
  return (
    <StripeContext.Provider value={contextValue}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
} 