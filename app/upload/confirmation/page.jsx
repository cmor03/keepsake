'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import LoadingSpinner from '../../components/LoadingSpinner';

// Define image statuses (consider moving to a shared constants file)
const IMAGE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

function ConfirmationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null); // Ref to hold interval ID

  // Authentication check using Clerk
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }
    
    // Proceed with fetching order details
    fetchOrderDetails();
    
    // Cleanup function
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isLoaded, isSignedIn, router]);

  // Initial fetch for order details
  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order details');
      }
      
      setOrder(data.order);
      
    } catch (err) {
      setError(err.message || 'An error occurred while loading your order details');
    } finally {
      // Keep loading true initially, polling effect will set it false
      // setLoading(false); 
    }
  };

  // Polling effect for order status updates
  useEffect(() => {
    // Don't start polling until authenticated and initial order is fetched
    if (!isSignedIn || !order || !order.images || order.images.length === 0) {
      // If order fetch finished but no images, set loading to false
      if (!loading && order) { 
         setLoading(false);
      }
      return;
    }

    // Function to check if all images are done processing
    const areAllImagesDone = (images) => {
      return images.every(
        (img) => img.status === IMAGE_STATUS.COMPLETED || img.status === IMAGE_STATUS.FAILED
      );
    };

    // If images are already done, no need to poll
    if (areAllImagesDone(order.images)) {
        setLoading(false); // All done, stop loading indicator
        return;
    }

    // If initial load finished, but polling hasn't started, set loading false
    if(loading) setLoading(false); 

    // Start polling
    pollIntervalRef.current = setInterval(async () => {
      try {
        console.log(`Polling for order status: ${orderId}`); // Optional: for debugging
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          // Don't throw error, just log and continue polling maybe? Or stop? Let's stop for now.
          console.error('Polling error:', data.error || 'Failed to fetch order update');
          clearInterval(pollIntervalRef.current); // Stop polling on error
          setError('Failed to get order updates. Please check your dashboard later or contact support.');
          return;
        }

        const updatedOrder = data.order;
        setOrder(updatedOrder); // Update the order state

        // Check if all images are done after update
        if (updatedOrder.images && areAllImagesDone(updatedOrder.images)) {
          console.log(`All images processed for order: ${orderId}. Stopping poll.`); // Optional: for debugging
          clearInterval(pollIntervalRef.current); // Stop polling
        }
      } catch (err) {
        console.error('Polling fetch error:', err);
        clearInterval(pollIntervalRef.current); // Stop polling on fetch error
        setError('An error occurred while checking for updates.');
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup function for the polling effect
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [order, orderId, loading, isSignedIn]); // Rerun effect if order data changes or loading/auth state changes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="py-12 px-8 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || 'Order not found'}</p>
            <Link href="/upload" className="mt-4 inline-block text-blue-600 hover:underline">
              Go back to upload page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-8 sm:px-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Order Confirmation</h1>
          <div className="text-sm text-gray-500">Step 3 of 3</div>
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
              <div className="w-6 h-6 bg-gray-700 text-white dark:bg-gray-300 dark:text-black rounded-full flex items-center justify-center mx-auto">
                ✓
              </div>
            </div>
            <div className="flex-1">
              <div className="w-6 h-6 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center mx-auto">
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
              <div className="h-full w-full bg-black dark:bg-white"></div>
            </div>
            <div className="flex-1 h-full">
              <div className="h-full w-full bg-black dark:bg-white"></div>
            </div>
          </div>
          
          {/* Step Labels */}
          <div className="flex text-sm text-center mt-4">
            <div className="flex-1 text-gray-500">Select Images</div>
            <div className="flex-1 text-gray-500">Checkout</div>
            <div className="flex-1 font-medium">Confirmation</div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl my-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Thank you for your order!</h2>
              <p className="mt-1">
                Your payment was successful. We are processing your images. They will appear below once ready.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Order Number</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Status</p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Processing
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Number of Images</p>
                <p className="font-medium">{order.images.length}</p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Payment</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                  <span className="font-medium">${order.finalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Delivery</p>
                <p className="font-medium">Your images will be transformed automatically and available in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Your Images</h2>
          
          {(!order.images || order.images.length === 0) ? (
             <p className="text-gray-500">No images found in this order.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {order.images.map((image, index) => (
                <div 
                  key={image._id || image.id || index} // Use a stable ID if available
                  className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center text-gray-400"
                >
                  {/* Conditional Rendering based on image status */}
                  {(!image.status || image.status === IMAGE_STATUS.PENDING || image.status === IMAGE_STATUS.PROCESSING) && (
                    <div className="text-center p-2">
                       <LoadingSpinner size="md" />
                       <p className="text-xs mt-2">Processing...</p>
                    </div>
                  )}

                  {/* Use transformedImageUrl from the model */}
                  {image.status === IMAGE_STATUS.COMPLETED && image.transformedImageUrl && (
                    <Image 
                      // Assuming transformedImageUrl is the public URL from blob storage
                      src={image.transformedImageUrl} 
                      alt={image.name || `Processed Image ${index + 1}`}
                      fill
                    />
                  )}
                  
                  {image.status === IMAGE_STATUS.FAILED && (
                     <div className="text-center p-2 text-red-500">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <p className="text-xs font-medium">Failed</p>
                     </div>
                  )}

                  {/* Fallback/Original - Display if status is unknown and original URL exists */}
                  {image.status !== IMAGE_STATUS.COMPLETED && image.status !== IMAGE_STATUS.FAILED && image.status !== IMAGE_STATUS.PENDING && image.status !== IMAGE_STATUS.PROCESSING && image.originalImageUrl && (
                     <Image 
                       src={image.originalImageUrl} // Use direct blob URL
                       alt={image.name || `Original Image ${index + 1}`}
                       fill
                     />
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
} 