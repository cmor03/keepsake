'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import LoadingSpinner from '../../components/LoadingSpinner';

function TransformPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [transformedUrl, setTransformedUrl] = useState('');
  const [transformStatus, setTransformStatus] = useState('processing');
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  // Get parameters from URL
  const orderId = searchParams.get('orderId');
  const imageId = searchParams.get('imageId');
  
  // Polling mechanism to check transformation status
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!orderId || !imageId) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    let pollingInterval;
    
    const checkTransformationStatus = async () => {
      try {
        const response = await fetch(`/api/transformations/${imageId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to get transformation status');
        }
        
        // If component was unmounted, don't update state
        if (!isMounted) return;
        
        if (data.transformation) {
          setOriginalUrl(data.transformation.originalImageUrl || '');
          
          if (data.transformation.status === 'completed') {
            setTransformedUrl(data.transformation.transformedImageUrl || '');
            setTransformStatus('completed');
            setShowContinueButton(true);
            
            // Clear polling interval
            if (pollingInterval) {
              clearInterval(pollingInterval);
            }
          } else if (data.transformation.status === 'failed') {
            setTransformStatus('failed');
            setError(data.transformation.error || 'Transformation failed');
            
            // Clear polling interval
            if (pollingInterval) {
              clearInterval(pollingInterval);
            }
          } else {
            setTransformStatus('processing');
          }
        } else {
          throw new Error('Transformation not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking transformation status:', err);
        
        // If component was unmounted, don't update state
        if (!isMounted) return;
        
        setError(err.message || 'Something went wrong');
        setLoading(false);
        
        // Clear polling interval
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      }
    };
    
    // Check status immediately
    checkTransformationStatus();
    
    // Then poll every 5 seconds
    pollingInterval = setInterval(checkTransformationStatus, 5000);
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isLoaded, orderId, imageId]);
  
  const handleContinue = () => {
    router.push(`/upload/checkout?orderId=${orderId}`);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading transformation...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-12 px-8 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => router.push('/upload')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Go back to upload
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
          <h1 className="text-3xl font-bold">Transforming Image</h1>
          <div className="text-sm text-gray-500">Step 1b of 3</div>
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
              <div className="w-6 h-6 bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full flex items-center justify-center mx-auto">
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
              <div className="h-full w-1/2 bg-black dark:bg-white ml-auto"></div>
            </div>
            <div className="flex-1 h-full">
              <div className="h-full w-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
          
          {/* Step Labels */}
          <div className="flex text-sm text-center mt-4">
            <div className="flex-1 font-medium">Select Images</div>
            <div className="flex-1 text-gray-500">Checkout</div>
            <div className="flex-1 text-gray-500">Confirmation</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original Image */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Original Image</h2>
            <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              {originalUrl ? (
                <Image 
                  src={originalUrl}
                  alt="Original image"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Image not available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Transformed Image */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Transformed Image</h2>
            <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              {transformStatus === 'completed' && transformedUrl ? (
                <Image 
                  src={transformedUrl}
                  alt="Transformed image"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  {transformStatus === 'processing' ? (
                    <>
                      <LoadingSpinner size="md" />
                      <p className="text-gray-600 mt-4 text-center">Processing your AI portrait...</p>
                      <p className="text-gray-400 text-sm mt-2 text-center">
                        This may take a few minutes.
                      </p>
                    </>
                  ) : transformStatus === 'failed' ? (
                    <p className="text-red-500 text-center">
                      Transformation failed. Please try again.
                    </p>
                  ) : (
                    <p className="text-gray-500 text-center">Image not available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showContinueButton && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransformPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading transformation...</p>
        </div>
      </div>
    }>
      <TransformPageContent />
    </Suspense>
  );
} 