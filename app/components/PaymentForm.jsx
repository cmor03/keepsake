'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CardElement, useStripe as useStripeElement, useElements } from '@stripe/react-stripe-js';
import { useStripe } from './StripeProvider';
import LoadingSpinner from './LoadingSpinner';

export default function PaymentForm({ order, email }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const cardElementRef = useRef(null);
  
  // Get the Stripe context functions
  const { updateOrderAfterPayment } = useStripe();
  
  // Get the Stripe.js and Elements objects from react-stripe-js
  const stripeJs = useStripeElement();
  const elements = useElements();
  
  // Handle Stripe element change
  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : '');
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripeJs || !elements) {
      setCardError('Payment system is not ready yet. Please try again.');
      return;
    }
    
    if (!order || !order.id) {
      setCardError('Invalid order information');
      return;
    }
    
    if (!order.clientSecret) {
      setCardError('Payment not initialized correctly. Please refresh the page.');
      return;
    }
    
    if (!email) {
      setCardError('Please provide your email');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get the card element directly from the DOM
      const cardElement = elements.getElement(CardElement);
      cardElementRef.current = cardElement;
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      
      // Use Stripe.js directly instead of our custom context function
      const { error, paymentIntent } = await stripeJs.confirmCardPayment(
        order.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: email,
            },
          },
          receipt_email: email,
        }
      );
      
      if (error) {
        throw new Error(error.message || 'Payment failed. Please try again.');
      }
      
      if (!paymentIntent || !paymentIntent.id) {
        throw new Error('Payment failed. Please try again.');
      }
      
      // If payment successful, update the order status
      await updateOrderAfterPayment(order.id, paymentIntent.id);
      
      // Mark payment as successful (briefly shows success message before redirect)
      setPaymentSucceeded(true);

      // Redirect to confirmation page immediately after success
      router.push(`/upload/confirmation?orderId=${order.id}`);
      
    } catch (error) {
      console.error('Payment error:', error);
      setCardError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Get the amount to display
  const displayAmount = order?.finalAmount || order?.totalAmount || order?.amount || 0;
  
  // If payment succeeded, show success message
  if (paymentSucceeded) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h3 className="text-lg font-medium text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-700 mb-4">Your payment has been processed successfully.</p>
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            We'll send your receipt and processed images to this email.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Details
          </label>
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <div className="mt-2 text-sm text-red-600">
              {cardError}
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-500 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
          <span>All payments are secure and encrypted</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
          <span>Powered by</span>
          <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
            <path d="M59.64 14.28h-8.06v1.59h5.39v1.65h-5.39v1.71h8.06v1.76H49.76v-8.47h9.88v1.76zm-15.89-1.76h3.53l-4.47 8.47h-2.05l-4.47-8.47h3.5l1.97 4.99 1.99-4.99zm-12.33 4.22c0-2.49 1.9-4.23 4.47-4.23 2.54 0 4.41 1.74 4.41 4.23s-1.87 4.25-4.41 4.25c-2.58 0-4.47-1.76-4.47-4.25zm6.17.01c0-1.08-.71-1.94-1.7-1.94s-1.7.86-1.7 1.94c0 1.1.71 1.95 1.7 1.95s1.7-.85 1.7-1.95zm-10.3-2.54l-.3 1.82c-.31-.06-.62-.1-.93-.1-1.19 0-1.56.68-1.56 1.53v4.77h-2.71v-8.21h2.64v.71a2.17 2.17 0 0 1 2.06-.77c.29 0 .56.05.8.25zM6.86 17.3l1.2-4.22 1.2 4.22h-2.4zm1.34-4.78h-2.68l-3.85 8.47h2.76l.67-1.69h3.48l.65 1.69h2.78l-3.81-8.47zm-6.2 8.47H0V9h2v11.99zM35 11.46a4.4 4.4 0 0 0-3.82 2.06V9H28.5v11.99h2.69v-3.8c0-1.8.97-2.18 1.82-2.18.78 0 1.55.37 1.55 1.8v4.18h2.69v-4.94c0-2.6-1.7-3.59-3.25-3.59z" fill="currentColor"></path>
          </svg>
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || !order?.clientSecret}
          className={`w-full sm:w-auto px-6 py-3 rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
            isProcessing || !order?.clientSecret
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${displayAmount.toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
} 