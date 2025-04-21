import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function UploadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-8 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Upload Your Listing Photos</h1>
            <div className="text-sm text-gray-500">Step 1 of 3</div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative pt-4 pb-12">
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
            <div className="absolute top-7 left-0 right-0 h-1 flex">
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
            <div className="flex text-sm text-center mt-4">
              <div className="flex-1 font-medium">Select Images</div>
              <div className="flex-1 text-gray-500">Checkout</div>
              <div className="flex-1 text-gray-500">Confirmation</div>
            </div>
          </div>
          
          {/* Upload Area */}
          <div className="mt-8 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4 flex text-sm justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                <span>Upload files</span>
                <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 20MB each</p>
          </div>
          
          {/* Selected Images Preview */}
          <div className="mt-10">
            <h3 className="text-lg font-medium mb-4">Selected Images (0)</h3>
            
            {/* Empty state */}
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No images selected yet. Upload at least one image to continue.
              </p>
            </div>
            
            {/* This would be shown when images are uploaded */}
            <div className="hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative group">
                  <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {/* Image would be displayed here */}
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      Image {i}
                    </div>
                  </div>
                  <button className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span>Images</span>
              <span>0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span>Price per image</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between py-4 font-medium text-lg">
              <span>Total</span>
              <span>$0.00</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="mt-10 flex justify-end">
            <Link 
              href="/upload/checkout"
              className="rounded-full bg-black text-white dark:bg-white dark:text-black px-8 py-4 text-lg font-medium opacity-50 cursor-not-allowed"
            >
              Next: Checkout
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 