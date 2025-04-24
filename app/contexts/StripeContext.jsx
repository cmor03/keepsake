'use client';

import React, { createContext, useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Oxwm0FEdjsCvpFvOLSnB5MzGkUfP2OQW52IZqY8rCxEZELMJY86oaQSNP0upwtljyXjnR0EO4I2P67OvN6KF03w00A3qfDwWg');

// Create context
const StripeContext = createContext(null);

export const useStripe = () => useContext(StripeContext);

export const StripeProvider = ({ children }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to create a payment intent
  const createPaymentIntent = async (orderId, email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setOrderDetails(data.order);
      
      return data;
    } catch (err) {
      setError(err.message);

      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to confirm payment
  const confirmPayment = async () => {
    if (!paymentIntentId) {
      setError('No payment intent found');
      return null;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm payment');
      }
      
      // Reset state after successful payment
      setClientSecret(null);
      setPaymentIntentId(null);
      
      return data;
    } catch (err) {
      setError(err.message);

      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to reset stripe state
  const resetStripeState = () => {
    setClientSecret(null);
    setPaymentIntentId(null);
    setOrderDetails(null);
    setError(null);
  };

  const value = {
    clientSecret,
    paymentIntentId,
    orderDetails,
    loading,
    error,
    createPaymentIntent,
    confirmPayment,
    resetStripeState,
  };

  return (
    <StripeContext.Provider value={value}>
      {clientSecret ? (
        <Elements 
          stripe={stripePromise} 
          options={{ clientSecret, appearance: { theme: 'stripe' } }}
        >
          {children}
        </Elements>
      ) : (
        children
      )}
    </StripeContext.Provider>
  );
}; 