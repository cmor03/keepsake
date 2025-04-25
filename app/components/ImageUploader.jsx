'use client';

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';
import { calculatePrice } from '@/lib/utils';
import { useFileStore } from '@/lib/store/fileStore';

const ImageUploader = forwardRef(({ hideUploadButton = false, onFileCountChange }, ref) => {
  const [filePreviews, setFilePreviews] = useState([]);
  const setFilesInStore = useFileStore((state) => state.setFiles);
  const filesInStore = useFileStore((state) => state.files);
  const [error, setError] = useState(null);

  useImperativeHandle(ref, () => ({
    hasFiles: () => filesInStore.length > 0,
    getFileCount: () => filesInStore.length,
    getFileMetadata: () => filesInStore.map(f => ({ name: f.name, size: f.size, type: f.type })),
  }));

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(
      file => file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024
    );

    if (validFiles.length < acceptedFiles.length) {
      setError('Some files were rejected. Please only upload images under 20MB.');
    }

    const updatedFiles = [...filesInStore, ...validFiles];
    setFilesInStore(updatedFiles);

    const newPreviews = validFiles.map(file => ({
      name: file.name,
      previewUrl: URL.createObjectURL(file)
    }));
    setFilePreviews(prev => [...prev, ...newPreviews]);

    if (onFileCountChange) {
      onFileCountChange(updatedFiles.length);
    }
  }, [filesInStore, setFilesInStore, onFileCountChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (index) => {
    const updatedFiles = [...filesInStore];
    updatedFiles.splice(index, 1);
    setFilesInStore(updatedFiles);

    setFilePreviews(prev => {
      const newPreviews = [...prev];
      const removedPreview = newPreviews.splice(index, 1)[0];
      if (removedPreview) {
          URL.revokeObjectURL(removedPreview.previewUrl);
      }
      return newPreviews;
    });

    if (onFileCountChange) {
      onFileCountChange(updatedFiles.length);
    }
  };

  const clearAllFiles = () => {
    setFilesInStore([]);
    filePreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setFilePreviews([]);
    if (onFileCountChange) {
      onFileCountChange(0);
    }
  };

  useEffect(() => {
    return () => {
      filePreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, [filePreviews]);

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
      
      {filePreviews.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Selected Images ({filePreviews.length})</h3>
            <button 
              type="button"
              onClick={clearAllFiles}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filePreviews.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <Image 
                    src={file.previewUrl}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                    onLoad={() => URL.revokeObjectURL(file.previewUrl)}
                  />
                </div>
                <button 
                  onClick={() => removeFile(index)}
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