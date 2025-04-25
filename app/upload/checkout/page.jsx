'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaymentForm from '../../components/PaymentForm';
import { useStripe } from '../../components/StripeProvider';
import { calculatePrice } from '@/lib/utils';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [orderId, setOrderId] = useState(searchParams.get('orderId'));
  
  const [email, setEmail] = useState('');
  const [orderImages, setOrderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  
  // Get the Stripe context functions
  const { createPaymentIntent, processing, paymentError } = useStripe();
  
  // Check for order and authentication
  useEffect(() => {
    if (!isLoaded) return;
    
    // Check if we have an orderId in the URL
    if (!orderId) {
      // If no orderId in URL, check localStorage for pending order
      const pendingOrderId = localStorage.getItem('pendingOrderId');
      if (pendingOrderId) {
        setOrderId(pendingOrderId);
        router.replace(`/upload/checkout?orderId=${pendingOrderId}`);
        // Don't fetch yet as we're redirecting
        return;
      } else {
        // No order ID found anywhere, redirect to upload
        setError('No order found. Please upload images first.');
        setTimeout(() => {
          router.replace('/upload');
        }, 2000);
        return;
      }
    }
    
    // Clear localStorage once we're on the checkout page with an orderId
    localStorage.removeItem('pendingOrderId');
    localStorage.removeItem('pendingUploadOrder');
    
    // Fetch order details
    fetchOrderAndInitPayment();
  }, [isLoaded, router, orderId]);
  
  // Function to fix order email if missing
  const fixOrderEmail = async (orderId) => {
    try {
      const response = await fetch('/api/orders/fix-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fix order email');
      }
      
      const data = await response.json();
      return data.order.customerEmail;
    } catch (err) {
      console.error('Error fixing order email:', err);
      return null;
    }
  };
  
  const updateOrderEmail = async (email) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/update-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order email');
      }
      
      const data = await response.json();
      return data.order.customerEmail;
    } catch (err) {
      console.error('Error updating order email:', err);
      return null;
    }
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const updatedEmail = await updateOrderEmail(emailInput);
      if (updatedEmail) {
        setEmail(updatedEmail);
        setEmailSubmitted(true);
        // Re-init payment with updated email
        fetchOrderAndInitPayment();
      } else {
        throw new Error('Failed to update email');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating email');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrderAndInitPayment = async () => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    try {
      // Fetch order details first
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order details');
      }
      
      // Check if component is still mounted
      if (!isMounted) return;
      
      let orderData = data.order;
      setOrderImages(orderData.images || []);
      
      if (orderData.customerEmail) {
        setEmail(orderData.customerEmail);
        setEmailSubmitted(true);
      } else if (isSignedIn) {
        // If authenticated but no email in order, try to fix it
        const fixedEmail = await fixOrderEmail(orderId);
        if (fixedEmail) {
          orderData.customerEmail = fixedEmail;
          setEmail(fixedEmail);
          setEmailSubmitted(true);
        }
      }
      
      // Check if component is still mounted
      if (!isMounted) return;
      
      setOrder(orderData);
      
      // For authenticated users or if we already have an email, create payment intent
      if (emailSubmitted || orderData.customerEmail) {
        try {
          // Create payment intent with all required fields
          const paymentData = await createPaymentIntent({
            orderId: orderData.id,
            amount: orderData.finalAmount || orderData.totalAmount,
            customerEmail: orderData.customerEmail,
            images: orderData.images || [],
          });
          
          // Check if component is still mounted
          if (!isMounted) return;
          
          // Update the order with payment intent data
          setOrder(prevOrder => ({
            ...prevOrder,
            clientSecret: paymentData.clientSecret,
            customerId: paymentData.customerId,
          }));
        } catch (paymentError) {
          console.error('Payment intent error:', paymentError);
          if (isMounted) {
            setError(paymentError.message || 'Error creating payment intent');
          }
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Checkout error:', err);
      if (isMounted) {
        setError(err.message || 'An error occurred while setting up checkout');
      }
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  };
  
  if (loading || processing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {processing ? 'Processing payment...' : 'Loading checkout...'}
          </p>
        </div>
      </div>
    );
  }
  
  if (error || paymentError) {
    return (
      <div className="py-12 px-8 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || paymentError}</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 text-blue-600 hover:underline"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no email provided yet and user is not signed in, show email form
  if (!isSignedIn && !emailSubmitted && !email) {
    return (
      <div className="py-12 px-8 sm:px-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Enter Your Email</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide your email address to continue with checkout.
            </p>
            
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue to Checkout
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-8 sm:px-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <div className="text-sm text-gray-500">Step 2 of 3</div>
        </div>
        
        {/* Progress Bar */}
        <div className="pb-12">
          {/* Step Numbers */}
          <div className="flex mb-2">
            <div className="flex-1">
              <div className="w-6 h-6 bg-gray-700 text-white dark:bg-gray-300 dark:text-black rounded-full flex items-center justify-center mx-auto">
                ✓
              </div>
            </div>
            <div className="flex-1">
              <div className="w-6 h-6 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center mx-auto">
                2
              </div>
            </div>
            <div className="flex-1">
              <div className="w-6 h-6 bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full flex items-center justify-center mx-auto">
                3
              </div>
            </div>
          </div>
          
          {/* Progress Line */}
          <div className="h-1 flex mt-2">
            <div className="flex-1 h-full">
              <div className="h-full w-full bg-black dark:bg-white"></div>
            </div>
            <div className="flex-1 h-full">
              <div className="h-full w-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
          
          {/* Step Labels */}
          <div className="flex text-sm text-center mt-4">
            <div className="flex-1 text-gray-500">Select Images</div>
            <div className="flex-1 font-medium">Checkout</div>
            <div className="flex-1 text-gray-500">Confirmation</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>{orderImages.length} Images</span>
                  <span>${((orderImages.length || 0) * 5.00).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between mb-2 text-gray-500">
                  <span>Discount</span>
                  <span>- ${((orderImages.length || 0) * 5.00 - (order?.totalAmount || 0)).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(order?.finalAmount || order?.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">Selected Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orderImages.map((image, index) => (
                  <div key={index} className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                    {image.originalImageUrl && (
                      <Image 
                        src={image.originalImageUrl}
                        alt={image.name || `Image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Payment Form */}
          <div>
            <PaymentForm order={order} email={email} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
} 