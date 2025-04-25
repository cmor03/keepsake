'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import LoadingSpinner from './LoadingSpinner';
import { useFileStore } from '@/lib/store/fileStore';

export default function CheckoutForm({
  orderId,
  clientSecret,
  price,
  onSuccess,
  onError,
  onProcessingStateChange,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const filesToUpload = useFileStore((state) => state.files);
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentError(null);

    if (!stripe || !elements || !clientSecret) {
      onError('Stripe is not ready. Please wait and try again.');
      return;
    }

    setIsProcessingPayment(true);
    onProcessingStateChange('paying');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Could not find card details form element.');
      setIsProcessingPayment(false);
      onProcessingStateChange('error');
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        console.error('Stripe Payment Error:', stripeError);
        setPaymentError(stripeError.message || 'Payment failed. Please check your card details.');
        setIsProcessingPayment(false);
        onProcessingStateChange('error');
        onError(stripeError.message || 'Payment failed.');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded! Payment Intent:', paymentIntent);
        onProcessingStateChange('uploading');

        try {
          if (!filesToUpload || filesToUpload.length === 0) {
            throw new Error('No files found in store to upload.');
          }

          console.log(`Uploading ${filesToUpload.length} files for order ${orderId}...`);
          
          const formData = new FormData();
          filesToUpload.forEach(file => {
            formData.append('files', file);
          });
          
          const uploadUrl = `/api/orders/${orderId}/upload-and-process`;
          const uploadResponse = await fetch(uploadUrl, { 
            method: 'POST',
            body: formData,
          });
          
          const finalOrderData = await uploadResponse.json();
          
          if (!uploadResponse.ok || !finalOrderData.success) {
             throw new Error(finalOrderData.error || 'Upload API call failed after payment.');
          }
          
          if (!finalOrderData) {
             throw new Error('Upload completed but did not return order data.');
          }
          
          console.log('Upload successful, final order data:', finalOrderData);
          onSuccess(finalOrderData.order);

        } catch (uploadError) {
          console.error('File upload failed after successful payment:', uploadError);
          onError(`Payment succeeded, but file upload failed: ${uploadError.message}. Please contact support.`);
          onProcessingStateChange('error');
        }

      } else {
        console.warn('Payment status:', paymentIntent?.status);
        setPaymentError(`Payment status: ${paymentIntent?.status}. Please wait or contact support.`);
        setIsProcessingPayment(false);
        onProcessingStateChange('error');
        onError(`Payment status: ${paymentIntent?.status}`);
      }

    } catch (error) {
      console.error('Error during payment submission:', error);
      setPaymentError('An unexpected error occurred during payment.');
      setIsProcessingPayment(false);
      onProcessingStateChange('error');
      onError('An unexpected error occurred.');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        iconColor: '#6b7280',
        color: '#111827',
        fontWeight: '500',
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': { color: '#fce883' },
        '::placeholder': { color: '#9ca3af' },
      },
      invalid: {
        iconColor: '#ef4444',
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card details
        </label>
        <div className="mt-1 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
          <CardElement id="card-element" options={cardElementOptions} />
        </div>
      </div>

      {paymentError && (
        <div className="text-xs text-red-600 dark:text-red-400 text-center">{paymentError}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessingPayment}
        className={`w-full rounded-lg px-6 py-3 text-base font-semibold flex items-center justify-center transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${ 
          !stripe || isProcessingPayment
            ? 'bg-gray-400 dark:bg-gray-500 text-gray-700 dark:text-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-500'
        }`}
      >
        {isProcessingPayment ? (
          <>
            <LoadingSpinner size="sm" className="mr-2 border-white/50 border-t-white" /> 
            Processing...
          </>
        ) : (
          `Pay $${price.toFixed(2)} Securely`
        )}
      </button>
    </form>
  );
} 