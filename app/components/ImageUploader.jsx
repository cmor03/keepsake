'use client';

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';
import { calculatePrice } from '@/lib/utils';

const ImageUploader = forwardRef(({ onUploadComplete, hideUploadButton = false }, ref) => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadedOrder, setUploadedOrder] = useState(null);
  const abortControllerRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    hasFiles: () => files.length > 0,
    getFileCount: () => files.length,
    uploadFiles: () => uploadImages(),
  }));

  const onDrop = useCallback((acceptedFiles) => {
    // Filter for image files and size limit
    const validFiles = acceptedFiles.filter(
      file => file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024 // 20MB limit
    );
    
    // Add preview URLs to the files
    const filesWithPreviews = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...filesWithPreviews]);
    
    // Show error if any files were rejected
    if (validFiles.length < acceptedFiles.length) {
      setError('Some files were rejected. Please only upload images under 20MB.');
    }

    // Show thumbnails first, don't immediately upload unless hideUploadButton is true
    if (validFiles.length > 0 && hideUploadButton) {
      // Pass the files directly instead of relying on state update
      uploadImages(filesWithPreviews).catch(err => {
        console.error('Upload failed:', err);
        setError(err.message || 'Failed to upload images');
      });
    }
  }, [hideUploadButton]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  });
  
  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  const removeUploadedFile = async (imageId) => {
    if (!uploadedOrder) return;
    
    try {
      // Call API to remove the image from the order
      const response = await fetch(`/api/orders/${uploadedOrder.id}/remove-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove image');
      }
      
      // Update the uploaded files list
      setUploadedFiles(prev => prev.filter(img => img.id !== imageId));
      
      // Update the order data
      if (onUploadComplete) {
        onUploadComplete({
          ...uploadedOrder,
          imageCount: uploadedOrder.imageCount - 1,
          totalAmount: calculateImageTotal(uploadedOrder.imageCount - 1),
        });
      }
      
    } catch (err) {
      setError(err.message || 'Failed to remove image');
    }
  };
  
  // Helper function to calculate total
  const calculateImageTotal = (count) => {
    return calculatePrice(count);
  };
  
  const uploadImages = async (filesToUpload) => {
    // Use passed files or current state
    const filesToProcess = filesToUpload || files;
    
    if (!filesToProcess || filesToProcess.length === 0) {
      throw new Error('Please select at least one image to upload.');
    }
    
    console.log('Starting upload of', filesToProcess.length, 'files');
    setUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Create a new AbortController for this upload
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;
      
      // Create form data for file upload
      const formData = new FormData();
      filesToProcess.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        signal, // Pass the abort signal
      });
      
      const data = await response.json();
      console.log('Upload API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }
      
      // Clean up file previews to avoid memory leaks for files we just uploaded
      filesToProcess.forEach(file => URL.revokeObjectURL(file.preview));
      
      // Update the uploaded order
      setUploadedOrder(data.order);
      
      // Fetch the order details to get the uploaded images
      const orderResponse = await fetch(`/api/orders/${data.order.id}`);
      const orderData = await orderResponse.json();
      console.log('Order details:', orderData);
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to fetch order details');
      }
      
      // Update the uploaded files list
      setUploadedFiles(orderData.order.images || []);
      
      // Call the success callback with the order data
      if (onUploadComplete) {
        console.log('Calling onUploadComplete with:', data.order);
        onUploadComplete(data.order);
      }
      
      // Clear the files state (for the upload form)
      setFiles([]);
      setProgress(100);
      
      return data.order;
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Upload was cancelled.');
        throw new Error('Upload was cancelled.');
      } else {
        setError(err.message || 'An error occurred during upload.');
        throw err;
      }
    } finally {
      setUploading(false);
    }
  };
  
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clean up preview URLs to avoid memory leaks
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <div>
      <div 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
        } dark:border-gray-700 dark:bg-gray-900 rounded-xl text-center transition-all`}
      >
        <input {...getInputProps()} />
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-4 flex text-sm justify-center">
          <p className="pl-1">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop image files here, or click to select files'}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 20MB each</p>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Files to be uploaded - Show this section first for better UX */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Selected Images ({files.length})</h3>
            {!uploading && (
              <button 
                type="button"
                onClick={() => setFiles([])} 
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <Image 
                    src={file.preview} 
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                  />
                </div>
                {!uploading && (
                  <button 
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {uploading && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Uploading images...</p>
                <button 
                  onClick={cancelUpload}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Only show the upload button if not hidden by props */}
          {!uploading && !hideUploadButton && (
            <button
              type="button"
              onClick={() => uploadImages()}
              className="mt-6 w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex justify-center items-center"
            >
              Upload {files.length} {files.length === 1 ? 'Image' : 'Images'}
            </button>
          )}
        </div>
      )}
      
      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Uploaded Images ({uploadedFiles.length})</h3>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {uploadedFiles.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {/* Use originalImageUrl if available, else fallback to preview (local blob URL) */}
                  {image.originalImageUrl || image.preview ? (
                    <Image
                      src={image.originalImageUrl || image.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v12h8V4H6zm8 12h2a2 2 0 002-2v-2h-2v2zM6 14H4v2a2 2 0 01-2-2v-2h2v2zm10-10V4a2 2 0 00-2-2h-2v2h2v2zM4 6H2a2 2 0 00-2 2v2h2V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeUploadedFile(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader; 