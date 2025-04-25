'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../components/CheckoutForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFileStore } from '@/lib/store/fileStore';

// Load Stripe Promise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();

  // Get only necessary state/actions from Zustand store
  const files = useFileStore((state) => state.files);
  const clearOrder = useFileStore((state) => state.clearOrder);

  // Use local state for payment details fetched via API
  const [localClientSecret, setLocalClientSecret] = useState(null);
  const [localTotalAmount, setLocalTotalAmount] = useState(0);
  const [localImageCount, setLocalImageCount] = useState(0); // For display

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingState, setProcessingState] = useState('idle'); // idle, fetching, paying, uploading, success, error
  const [previewUrls, setPreviewUrls] = useState([]); // State for thumbnail URLs
  
  // Get orderId from URL
  const orderIdFromUrl = searchParams.get('orderId');

  // Effect to fetch payment details based on orderId from URL
  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk
    
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/upload');
      return;
    }

    if (!orderIdFromUrl) {
      setError("Missing order information in URL.");
      setIsLoading(false);
      return;
    }
    
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError("Payment system configuration error.");
      setIsLoading(false);
      return;
    }

    const fetchPaymentDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // NEW API CALL
        const response = await fetch(`/api/orders/${orderIdFromUrl}/payment-details`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch payment details.');
        }
        
        if (!data.clientSecret || data.amount === undefined || data.imageCount === undefined) {
           throw new Error('Incomplete payment details received.');
        }
        
        console.log("Fetched payment details:", data);
        setLocalClientSecret(data.clientSecret);
        setLocalTotalAmount(data.amount);
        setLocalImageCount(data.imageCount); // Store image count for display

      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError(err.message);
        // Don't clearOrder here, let the user see the error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();

  }, [isLoaded, isSignedIn, router, orderIdFromUrl]); // Dependency on orderIdFromUrl

  // Effect to generate/revoke preview URLs (no change needed)
  useEffect(() => {
    if (files && files.length > 0) {
      const urls = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
      setPreviewUrls(urls);
    }
    return () => {
      setPreviewUrls(currentUrls => {
          currentUrls.forEach(item => URL.revokeObjectURL(item.url));
          return [];
      });
    };
  }, [files]);

  const handlePaymentAndUploadSuccess = (finalOrderData) => {
     console.log('CheckoutForm reported success:', finalOrderData);
     setProcessingState('success');
     setError(null);
     // Clear the Zustand store (files primarily) now that the process is complete
     clearOrder(); 
     // Redirect to confirmation page
     router.push(`/upload/confirmation?orderId=${orderIdFromUrl}`);
  };

  const handlePaymentError = (errorMessage) => {
      setError(`Payment/Upload Error: ${errorMessage}`);
      setProcessingState('error');
  };

  // --- Render Logic ---
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /><span>&nbsp;Loading checkout details...</span></div>;
  }

  if (error) {
      return <div className="p-8 text-center text-red-600">Error: {error} <button onClick={() => router.push('/upload')} className="ml-2 text-blue-600 underline">Go back</button></div>;
  }

  // Fallback check if fetching succeeded but data is missing (should be caught by fetch logic)
  if (!localClientSecret) {
       return <div className="p-8 text-center text-red-600">Missing payment information. Please try returning to the upload page.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        <div className="text-center">
             <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
               Secure Checkout
             </h1>
             <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
               Review your order and complete your payment.
             </p>
        </div>
        
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-filter backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
                {/* Order Summary - Use local state now */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">Order Summary</h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Order ID:</dt>
                            <dd className="font-medium text-gray-800 dark:text-gray-200 font-mono text-xs">{orderIdFromUrl}</dd> {/* Use ID from URL */}
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Images:</dt>
                            {/* Display count fetched from API, fallback to store length if needed */}
                            <dd className="font-medium text-gray-800 dark:text-gray-200">{localImageCount || files.length}</dd> 
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <dt className="text-base font-semibold text-gray-900 dark:text-white">Total:</dt>
                            <dd className="text-base font-semibold text-gray-900 dark:text-white">${localTotalAmount.toFixed(2)}</dd> {/* Use amount from local state */}
                        </div>
                    </dl>
                </div>

                {/* Thumbnail Preview Section - No change needed */}
                {previewUrls.length > 0 && (
                  <div className="mb-8">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Selected Images ({previewUrls.length})</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                          {previewUrls.map((item, index) => (
                          <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative shadow-sm">
                              <img 
                              src={item.url}
                              alt={item.name}
                              className="object-cover w-full h-full"
                              />
                          </div>
                          ))}
                      </div>
                  </div>
                )}

                {/* Payment Form - Use local state */}
                <Elements stripe={stripePromise} options={{ clientSecret: localClientSecret }}>
                    <CheckoutForm 
                        orderId={orderIdFromUrl} /* Pass ID from URL */
                        clientSecret={localClientSecret} /* Pass secret from local state */
                        price={localTotalAmount} /* Pass amount from local state */
                        onSuccess={handlePaymentAndUploadSuccess}
                        onError={handlePaymentError}
                        onProcessingStateChange={setProcessingState}
                    />
                </Elements>
            </div>
        </div>
        
        {/* Display processing state below the card */}
        {processingState === 'paying' && (
              <div className='mt-4 text-center text-sm text-blue-600 flex items-center justify-center'><LoadingSpinner size="xs" className="mr-2"/> Processing payment...</div>
          )}
        {processingState === 'uploading' && (
            <div className='mt-4 text-center text-sm text-blue-600 flex items-center justify-center'><LoadingSpinner size="xs" className="mr-2"/> Finalizing order and uploading files...</div>
        )}
        {processingState === 'success' && (
            <p className='mt-4 text-center text-sm text-green-600'>Order completed successfully! Redirecting...</p>
        )}
      </div>
    </div>
  );
}

// Use Suspense to handle query param reading client-side
export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>}>
            <CheckoutPageContent />
        </Suspense>
    );
} 