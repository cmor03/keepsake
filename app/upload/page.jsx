'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import ImageUploader from '../components/ImageUploader';
import { calculatePrice } from '@/lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';

// --- REMOVED: Stripe Imports ---
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import CheckoutForm from '../components/CheckoutForm'; 
// --- END REMOVAL ---

// --- REMOVED: Load Stripe Promise ---
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// --- ADDED: Zustand Store Import ---
import { useFileStore } from '@/lib/store/fileStore';
// --- END ADDITION ---

export default function UploadPage() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  // const [uploadedOrder, setUploadedOrder] = useState(null); // Remove, use store later if needed
  const [imageCount, setImageCount] = useState(0); 
  const [price, setPrice] = useState(0);
  const [processingState, setProcessingState] = useState('idle'); // idle, initiating, error
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const imageUploaderRef = useRef(null);
  
  // --- ADDED: Get store actions ---
  const setOrderDetailsInStore = useFileStore((state) => state.setOrderDetails);
  const filesInStore = useFileStore((state) => state.files); // Get files for check
  // --- END ADDITION ---

  // --- REMOVED: State for Payment Flow ---
  // const [orderId, setOrderId] = useState(null);
  // const [clientSecret, setClientSecret] = useState(null);
  // const [showPaymentForm, setShowPaymentForm] = useState(false);
  // --- END REMOVAL ---

  // --- REMOVED: Check for Stripe Key ---
  // useEffect(() => { ... });
  // --- END REMOVAL ---

  // Allow both authenticated and non-authenticated users to access this page
  useEffect(() => {
    if (!isLoaded) return;
    setIsLoading(false);
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/upload');
      return;
    }
    // Clear any potentially stale file state on load?
    // useFileStore.getState().clearOrder(); // Optional: uncomment to always start fresh
    
    // Initialize count/price from store if files were somehow persisted (unlikely without refresh)
    const currentFiles = useFileStore.getState().files;
    if (currentFiles.length > 0) {
       handleFileCountChange(currentFiles.length);
    }
    
    // Remove local storage logic - we use Zustand now
    // const storedOrderData = localStorage.getItem('pendingUploadOrder');
    // ...
  }, [isLoaded, isSignedIn, router]);

  const getPricePerImage = (count) => {
    if (count >= 50) return 3.75;
    if (count >= 25) return 4.00;
    if (count >= 10) return 4.25;
    if (count >= 5) return 4.50;
    return 5.00;
  };

  const getDiscountPercentage = (count) => {
    if (count >= 50) return 25;
    if (count >= 25) return 20;
    if (count >= 10) return 15;
    if (count >= 5) return 10;
    return 0;
  };

  // --- REMOVED: handleUploadComplete --- 
  // const handleUploadComplete = (orderData) => { ... };

  const handleFileCountChange = (count) => {
    setImageCount(count);
    setPrice(calculatePrice(count)); 
  };

  // --- REVISED: handleProceedToCheckout --- 
  const handleProceedToCheckout = async () => {
    // Use hasFiles method from ref which reads store length
    if (!imageUploaderRef.current?.hasFiles()) { 
      setError('Please select at least one image to upload.');
      return;
    }
    if (processingState !== 'idle') return; 

    setError(null);
    setProcessingState('initiating');

    try {
      const fileMetadata = imageUploaderRef.current?.getFileMetadata();
      console.log('Initiating order with metadata:', fileMetadata);

      const response = await fetch('/api/orders/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: fileMetadata }),
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.orderId || !data.clientSecret) {
        throw new Error(data.error || 'Failed to initiate order. Missing required data.');
      }

      console.log('Order initiated, storing details:', data);
      
      // Store order details in Zustand store
      setOrderDetailsInStore({
          orderId: data.orderId,
          clientSecret: data.clientSecret,
          amount: data.amount // Store amount too
      });

      // Navigate to the separate checkout page
      router.push(`/upload/checkout?orderId=${data.orderId}`);
      // Note: processingState is reset on navigation automatically

    } catch (err) {
      console.error('Checkout initiation failed:', err);
      setError(err.message || 'Could not prepare checkout. Please try again.');
      setProcessingState('error'); // Reset state on error
    }
  };
  // --- END REVISION ---
  
  // --- REMOVED: handlePaymentAndUploadSuccess --- 
  // const handlePaymentAndUploadSuccess = (finalOrderData) => { ... };

  // Calculate display values based on state
  const displayPricePerImage = getPricePerImage(imageCount);
  const displayDiscountPercentage = getDiscountPercentage(imageCount);

  // --- Render Logic --- 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-12 px-8 sm:px-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Upload Your Listing Photos</h1>
          <div className="text-sm text-gray-500">Step 1 of 3</div>
        </div>
        
        {/* Progress Bar */}
        <div className="pb-12">
          {/* Step Numbers */}
          <div className="flex mb-2">
            <div className="flex-1">
              <div className="w-6 h-6 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center mx-auto">
                1
              </div>
            </div>
            <div className="flex-1">
              <div className="w-6 h-6 bg-gray-200 text-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                2
              </div>
            </div>
            <div className="flex-1">
              <div className="w-6 h-6 bg-gray-200 text-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
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
              <div className="h-full w-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="flex-1 h-full">
              <div className="h-full w-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          
          {/* Step Labels */}
          <div className="flex text-sm text-center mt-4">
            <div className="flex-1 font-medium">Select Images</div>
            <div className="flex-1 text-gray-500">Checkout</div>
            <div className="flex-1 text-gray-500">Confirmation</div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Upload Area */}
        <div className={`mt-8 ${processingState === 'initiating' ? 'opacity-50 pointer-events-none' : ''}`}> 
          <ImageUploader 
            ref={imageUploaderRef}
            hideUploadButton={true}
            onFileCountChange={handleFileCountChange}
          />
        </div>
        
        {/* Order Summary */}
        <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span>Images</span>
            <span>{imageCount}</span> 
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span>Price per image</span>
            <div className="text-right">
              <span>${displayPricePerImage.toFixed(2)}</span>
              {displayDiscountPercentage > 0 && (
                <span className="ml-2 text-sm text-green-600">({displayDiscountPercentage}% off)</span>
              )}
            </div>
          </div>
          <div className="flex justify-between py-4 font-medium text-lg">
            <span>Total</span>
            <span>${price.toFixed(2)}</span> 
          </div>
          {/* ... Discount Info ... */} 
          {imageCount > 0 && displayDiscountPercentage > 0 && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                You're saving ${((5.00 - displayPricePerImage) * imageCount).toFixed(2)} with your current discount!
              </p>
            )}
          {/* --- Processing State Message (Simplified) --- */}
          {processingState === 'initiating' && (
              <div className='mt-4 text-sm text-blue-600 flex items-center'> 
                  <LoadingSpinner size="xs" className="mr-2"/> Preparing checkout...
              </div>
          )}
        </div>

        {/* --- REMOVED: Payment Form Section --- */}
        
        {/* Navigation Button */}
        <div className="mt-10 flex justify-end">
        <button 
            onClick={handleProceedToCheckout}
            disabled={processingState !== 'idle' || !imageUploaderRef.current?.hasFiles()} // Disable if initiating or no files
            className={`rounded-full px-8 py-4 text-lg font-medium flex items-center ${
            processingState === 'initiating'
                ? 'bg-gray-500 text-white cursor-wait'
                : imageUploaderRef.current?.hasFiles()
                ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' 
                : 'bg-gray-300 text-gray-500 dark:bg-gray-700 cursor-not-allowed'
            } transition-colors`}
        >
            {processingState === 'initiating' ? (
            <>
                <LoadingSpinner size="sm" className="mr-2" />
                Preparing...
            </>
            ) : 'Proceed to Checkout'} 
        </button>
        </div>
      </div>
    </div>
  );
}