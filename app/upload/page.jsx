'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import ImageUploader from '../components/ImageUploader';
import { calculatePrice } from '@/lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UploadPage() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [uploadedOrder, setUploadedOrder] = useState(null);
  const [imageCount, setImageCount] = useState(0);
  const [price, setPrice] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const imageUploaderRef = useRef(null);

  // Check authentication using Clerk
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.replace('/sign-in');
    } else {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  // Calculate price per image based on image count
  const getPricePerImage = (count) => {
    if (count >= 50) return 3.75;
    if (count >= 25) return 4.00;
    if (count >= 10) return 4.25;
    if (count >= 5) return 4.50;
    return 5.00;
  };

  // Calculate discount percentage
  const getDiscountPercentage = (count) => {
    if (count >= 50) return 25;
    if (count >= 25) return 20;
    if (count >= 10) return 15;
    if (count >= 5) return 10;
    return 0;
  };

  const handleUploadComplete = (orderData) => {
    if (!orderData) return;
    
    console.log('Upload complete:', orderData);
    setUploadedOrder(orderData);
    setImageCount(orderData.imageCount || 0);
    setPrice(orderData.totalAmount || 0);
    setIsUploading(false);
    setError(null); // Clear any existing errors
  };

  const handleProceedToCheckout = async () => {
    // First check if we have an order with uploaded images
    if (uploadedOrder?.id && uploadedOrder.imageCount > 0) {
      router.push(`/upload/checkout?orderId=${uploadedOrder.id}`);
      return;
    }
    
    // If there are files in the uploader that haven't been uploaded yet
    if (imageUploaderRef.current?.hasFiles()) {
      setIsUploading(true);
      setError(null);
      
      try {
        await imageUploaderRef.current.uploadFiles();
        // We don't need to redirect here since handleUploadComplete will update the state
      } catch (err) {
        setError(err.message || 'Failed to upload images. Please try again.');
        setIsUploading(false);
      }
    } else {
      // Only show error if there are no files and no uploaded images
      setError('Please select at least one image to upload.');
    }
  };

  // Calculate current price per image and discount
  const currentPricePerImage = getPricePerImage(imageCount);
  const discountPercentage = getDiscountPercentage(imageCount);

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
        
        {/* Display error message if any */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Upload Area */}
        <div className="mt-8">
          <ImageUploader 
            ref={imageUploaderRef}
            onUploadComplete={handleUploadComplete} 
            hideUploadButton={true}
          />
        </div>
        
        {/* Order Summary */}
        <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span>Images</span>
            <span>{imageCount || (imageUploaderRef.current?.getFileCount() || 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span>Price per image</span>
            <div className="text-right">
              <span>${currentPricePerImage.toFixed(2)}</span>
              {discountPercentage > 0 && (
                <span className="ml-2 text-sm text-green-600">({discountPercentage}% off)</span>
              )}
            </div>
          </div>
          <div className="flex justify-between py-4 font-medium text-lg">
            <span>Total</span>
            <span>${(uploadedOrder ? price : calculatePrice(imageUploaderRef.current?.getFileCount() || 0)).toFixed(2)}</span>
          </div>
          
          {/* Volume Discount Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Volume Discounts Available
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li className="flex justify-between">
                <span>1-4 images:</span>
                <span>$5.00 per image</span>
              </li>
              <li className="flex justify-between">
                <span>5-9 images:</span>
                <span>$4.50 per image (10% off)</span>
              </li>
              <li className="flex justify-between">
                <span>10-24 images:</span>
                <span>$4.25 per image (15% off)</span>
              </li>
              <li className="flex justify-between">
                <span>25-49 images:</span>
                <span>$4.00 per image (20% off)</span>
              </li>
              <li className="flex justify-between">
                <span>50+ images:</span>
                <span>$3.75 per image (25% off)</span>
              </li>
            </ul>
            {imageCount > 0 && discountPercentage > 0 && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                You're saving ${((5.00 - currentPricePerImage) * imageCount).toFixed(2)} with your current discount!
              </p>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="mt-10 flex justify-end">
          <button 
            onClick={handleProceedToCheckout}
            disabled={isUploading || (!(uploadedOrder?.imageCount > 0) && !imageUploaderRef.current?.hasFiles())}
            className={`rounded-full px-8 py-4 text-lg font-medium flex items-center ${
              isUploading
                ? 'bg-gray-500 text-white cursor-wait'
                : ((uploadedOrder?.imageCount > 0) || imageUploaderRef.current?.hasFiles())
                  ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' 
                  : 'bg-gray-300 text-gray-500 dark:bg-gray-700 cursor-not-allowed'
            } transition-colors`}
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Uploading...
              </>
            ) : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
} 