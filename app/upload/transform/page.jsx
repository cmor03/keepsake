'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const POLLING_INTERVAL = 5000; // Check every 5 seconds
const MAX_POLLS = 36; // Max 3 minutes (36 * 5 seconds)

function TransformPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const orderId = searchParams.get('orderId');
  const imageId = searchParams.get('imageId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Initializing transformation...");
  const [transformedImage, setTransformedImage] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  const pollCount = useRef(0);
  const intervalId = useRef(null);

  // Authentication check using Clerk
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }
    
    // Check for missing parameters
    if (!orderId || !imageId) {
      setError('Missing order or image information. Please try again.');
      setLoading(false);
      return;
    }

    const clearPolling = () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };

    const checkOrderStatus = async () => {
      if (pollCount.current >= MAX_POLLS) {
        setError("Transformation is taking longer than expected. Please check your dashboard later.");
        clearPolling();
        setLoading(false);
        return;
      }
      
      pollCount.current += 1;
      setStatusMessage(`Checking progress... (Attempt ${pollCount.current})`);
      
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        
        if (!response.ok) {
          // Keep polling even on temp error, but log it
          console.warn(`Polling error: ${data.error || 'Failed to fetch order status'}`);
          return; 
        }
        
        const order = data.order;
        const targetImage = order?.images?.find(img => img.id === imageId);
        
        if (targetImage?.transformedImageUrl) {
          console.log("Transformation complete! Image found:", targetImage.transformedImageUrl);
          setTransformedImage(targetImage.transformedImageUrl);
          setStatusMessage("Transformation Complete!");
          setIsComplete(true);
          clearPolling();
          setLoading(false); // Stop main loading indicator
          
          // Redirect to dashboard after a delay
          setTimeout(() => {
            router.push(`/dashboard?highlightImage=${imageId}`);
          }, 3000);
        } else {
          // Not ready yet, poll will continue
          setStatusMessage("Processing... Still working on your image.");
        }
      } catch (err) {
        // Network or other fetch error, keep polling for a bit
        console.error('Polling fetch error:', err);
        setStatusMessage("Network issue while checking status, will retry...");
      }
    };

    // Start the transformation process
    const initiateTransform = async () => {
      setStatusMessage("Requesting transformation...");
      setLoading(true);
      try {
        const response = await fetch('/api/transform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, imageId }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start transformation');
        }

        // If already transformed, handle completion immediately
        if (data.image?.transformedImageUrl) {
           console.log("Image was already transformed:", data.image.transformedImageUrl);
           setTransformedImage(data.image.transformedImageUrl);
           setStatusMessage("Transformation Complete!");
           setIsComplete(true);
           setLoading(false); 
           setTimeout(() => {
             router.push(`/dashboard?highlightImage=${imageId}`);
           }, 3000);
        } else {
          // Transformation started, begin polling
          setStatusMessage("Transformation in progress... Checking status periodically.");
          setLoading(true); // Keep loading true while polling
          pollCount.current = 0; // Reset poll count
          intervalId.current = setInterval(checkOrderStatus, POLLING_INTERVAL);
          checkOrderStatus(); // Check immediately once
        }
      } catch (err) {
        console.error('Initiate transform error:', err);
        setError(err.message || 'Could not start transformation process.');
        setLoading(false);
      }
    };

    // Continue with transformation process
    initiateTransform();

    // Cleanup function
    return () => {
      clearPolling();
    };
  }, [isLoaded, isSignedIn, router, orderId, imageId]);
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <h2 className="text-lg font-medium mb-2">Transformation Error</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (loading && !isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-10 px-4 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{statusMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10 px-4 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">
          {isComplete ? "Transformation Complete!" : "Transforming Your Image"}
        </h1>
        
        <div className="mb-12 relative">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            {!isComplete ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
          </div>
          
          <p className="text-lg font-medium mb-4">
            {statusMessage}
          </p>
          
          {!isComplete && loading && (
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
               <div 
                 className="bg-blue-600 h-4 rounded-full animate-pulse"
                 style={{ width: `100%` }}
               ></div>
            </div>
          )}
          
          <p className="text-gray-600">
            {isComplete 
              ? "Redirecting to dashboard..."
              : "This may take a few moments. We'll check the progress periodically."}
          </p>
        </div>
        
        {isComplete && transformedImage && (
          <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200 animate-fade-in">
            <h2 className="text-lg font-medium mb-4">Preview</h2>
            <div className="relative pt-[100%] bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={transformedImage}
                alt="Transformed image"
                fill
                className="object-contain p-2 animate-fade-in"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransformPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-16 pb-10 px-4 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <TransformPageContent />
    </Suspense>
  );
} 