'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    async function fetchOrderDetails() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load order details');
        }
        
        setOrder(data.order);
        
        // If there are images in the order, redirect to transform page for the first image
        if (data.order.images && data.order.images.length > 0) {
          // Make sure we have a valid image ID
          const firstImage = data.order.images[0];
          if (firstImage && firstImage.id) {
            // Add a small delay to show confirmation before moving to transformation
            setTimeout(() => {
              setRedirecting(true);
              router.push(`/upload/transform?orderId=${orderId}&imageId=${firstImage.id}`);
            }, 3000);
          } else if (firstImage && firstImage._id) { 
            // Try alternative _id format
            setTimeout(() => {
              setRedirecting(true);
              router.push(`/upload/transform?orderId=${orderId}&imageId=${firstImage._id}`);
            }, 3000);
          } else {
            console.error("No valid image ID found:", firstImage);
            setError("Could not find a valid image to transform");
          }
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading your order details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderId, router]);
  
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
              <p className="mt-1">Your payment has been successfully processed. We'll start transforming your image right away.</p>
              {redirecting && (
                <p className="mt-2 text-green-600 font-medium">
                  Redirecting to transformation page...
                  <span className="inline-block ml-2 animate-pulse">•••</span>
                </p>
              )}
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
          <h2 className="text-xl font-bold mb-4">Images Preview</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {order.images.map((image, index) => (
              <div key={index} className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                {image.originalImage && (
                  <Image 
                    src={`/uploads/originals/${image.originalImage}`}
                    alt={image.name || `Image ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 