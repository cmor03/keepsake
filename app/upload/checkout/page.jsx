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

  // Get state from Zustand store individually
  const files = useFileStore((state) => state.files);
  const orderIdFromStore = useFileStore((state) => state.orderId);
  const clientSecret = useFileStore((state) => state.clientSecret);
  const totalAmount = useFileStore((state) => state.totalAmount);
  const clearOrder = useFileStore((state) => state.clearOrder);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingState, setProcessingState] = useState('idle'); // idle, paying, uploading, success, error
  const [previewUrls, setPreviewUrls] = useState([]); // State for thumbnail URLs
  
  // Get orderId from URL, validate against store
  const orderIdFromUrl = searchParams.get('orderId');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      // Redirect if not signed in (shouldn't happen if upload page worked)
      router.push('/sign-in?redirect_url=/upload');
      return;
    }
    if (!orderIdFromUrl) {
        setError("Missing order information.");
        setIsLoading(false);
        return;
    }
    if (orderIdFromUrl !== orderIdFromStore) {
        console.error(`Order ID mismatch: URL (${orderIdFromUrl}) vs Store (${orderIdFromStore})`);
        setError("Order details mismatch. Please return to the upload page and try again.");
        // Optionally clear the store here?
        // clearOrder(); 
        setIsLoading(false);
        return;
    }
    if (!clientSecret || files.length === 0) {
        setError("Missing payment details or files. Please return to the upload page.");
        setIsLoading(false);
        return;
    }
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError("Payment system configuration error.");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [isLoaded, isSignedIn, router, orderIdFromUrl, orderIdFromStore, clientSecret, files]);

  // --- ADDED: Effect to generate/revoke preview URLs --- 
  useEffect(() => {
    // Create URLs when files are available
    if (files && files.length > 0) {
      const urls = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
      setPreviewUrls(urls);
    }

    // Cleanup function to revoke URLs when component unmounts or files change
    return () => {
      setPreviewUrls(currentUrls => {
          currentUrls.forEach(item => URL.revokeObjectURL(item.url));
          return []; // Return empty array after revoking
      });
    };
  }, [files]); // Dependency on files from the store
  // --- END ADDITION ---

  const handlePaymentAndUploadSuccess = (finalOrderData) => {
     console.log('CheckoutForm reported success:', finalOrderData);
     setProcessingState('success');
     setError(null);
     // Clear the Zustand store now that the process is complete
     clearOrder(); 
     // Redirect to confirmation page
     router.push(`/upload/confirmation?orderId=${orderIdFromUrl}`);
  };

  const handlePaymentError = (errorMessage) => {
      setError(`Payment/Upload Error: ${errorMessage}`);
      setProcessingState('error');
      // Do NOT clear the order here, user might retry payment/upload
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
      // Basic error display, maybe add a button to go back?
      return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  if (!clientSecret || !orderIdFromStore) {
      // Should be caught by useEffect, but as a fallback
       return <div className="p-8 text-center text-red-600">Missing payment information.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Added a more styled header */}
        <div className="text-center">
             <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
               Secure Checkout
             </h1>
             <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
               Review your order and complete your payment.
             </p>
        </div>
        
        {/* Use a glassmorphism-style card for the main content */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-filter backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
                {/* Order Summary */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">Order Summary</h3>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Order ID:</dt>
                            <dd className="font-medium text-gray-800 dark:text-gray-200 font-mono text-xs">{orderIdFromStore}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Images:</dt>
                            <dd className="font-medium text-gray-800 dark:text-gray-200">{files.length}</dd>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <dt className="text-base font-semibold text-gray-900 dark:text-white">Total:</dt>
                            <dd className="text-base font-semibold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</dd>
                        </div>
                    </dl>
                </div>

                {/* --- ADDED: Thumbnail Preview Section --- */}
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
                {/* --- END ADDITION --- */}

                {/* Payment Form */}
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                        orderId={orderIdFromStore}
                        clientSecret={clientSecret}
                        price={totalAmount}
                        onSuccess={handlePaymentAndUploadSuccess}
                        onError={handlePaymentError}
                        onProcessingStateChange={setProcessingState}
                    />
                </Elements>
            </div>
        </div>
        
        {/* Display processing state below the card */}
        {processingState === 'paying' && (
              <p className='mt-4 text-center text-sm text-blue-600 flex items-center justify-center'><LoadingSpinner size="xs" className="mr-2"/> Processing payment...</p>
          )}
        {processingState === 'uploading' && (
            <p className='mt-4 text-center text-sm text-blue-600 flex items-center justify-center'><LoadingSpinner size="xs" className="mr-2"/> Finalizing order and uploading files...</p>
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