'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaymentForm from '../../components/PaymentForm';
import { useStripe } from '../../components/StripeProvider';
import { calculatePrice } from '@/lib/utils';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const [email, setEmail] = useState('');
  const [orderImages, setOrderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  
  // Get the Stripe context functions
  const { createPaymentIntent, processing, paymentError } = useStripe();
  
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
  
  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    async function fetchOrderAndInitPayment() {
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
        
        // If customerEmail is missing, try to fix it
        if (!orderData.customerEmail) {
          const fixedEmail = await fixOrderEmail(orderId);
          if (fixedEmail) {
            orderData.customerEmail = fixedEmail;
          } else {
            throw new Error('Customer email is missing and could not be fixed');
          }
        }
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        setEmail(orderData.customerEmail);
        setOrder(orderData);
        
        // Make sure we have all required fields for payment
        if (!orderData.id) {
          throw new Error('Order ID is missing');
        }
        
        if (!orderData.finalAmount && !orderData.totalAmount) {
          throw new Error('Order amount is missing');
        }
        
        if (!orderData.customerEmail) {
          throw new Error('Customer email is missing');
        }
        
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
      } catch (err) {
        console.error('Checkout error:', err);
        if (isMounted) {
          setError(err.message || 'An error occurred while setting up checkout');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchOrderAndInitPayment();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [orderId]); // Remove createPaymentIntent from dependencies
  
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