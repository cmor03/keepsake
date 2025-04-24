'use client';

import { useState } from 'react';
import { useStripe as useStripeJs, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useStripe } from '../contexts/StripeContext';
import LoadingSpinner from './LoadingSpinner';

export default function CheckoutForm({ email, setEmail, onSuccess }) {
  const stripe = useStripeJs();
  const elements = useElements();
  const { confirmPayment, orderDetails } = useStripe();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    if (!termsAccepted) {
      setError('You must accept the terms and conditions to proceed.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Confirm payment with Stripe.js
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/upload/confirmation',
          receipt_email: email,
        },
        redirect: 'if_required',
      });
      
      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }
      
      // If no redirect happened, confirm on the server
      const result = await confirmPayment();
      
      if (result.success) {
        // Payment confirmed successfully
        if (onSuccess) {
          onSuccess(result.order);
        }
      }
    } catch (err) {

      setError(err.message || 'An error occurred during payment processing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
        />
        <p className="mt-2 text-sm text-gray-500">
          Your receipt and coloring pages will be sent to this email.
        </p>
      </div>
      
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 text-black rounded focus:ring-0 focus:ring-offset-0" 
          />
          <span className="ml-2 text-sm">
            I agree to the {" "}
            <a href="/terms" className="underline" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
            {" "} and {" "}
            <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full rounded-full bg-black text-white dark:bg-white dark:text-black px-8 py-4 text-center text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" /> Processing...
          </>
        ) : (
          `Pay ${orderDetails?.total ? `$${orderDetails.total.toFixed(2)}` : ''}`
        )}
      </button>
    </form>
  );
} 