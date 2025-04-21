import React from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-8 sm:px-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Order Confirmation</h1>
            <div className="text-sm text-gray-500">Step 3 of 3</div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative pt-4 pb-12">
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
            <div className="absolute top-7 left-0 right-0 h-1 flex">
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
            <div className="flex text-sm text-center mt-4">
              <div className="flex-1 text-gray-500">Select Images</div>
              <div className="flex-1 text-gray-500">Checkout</div>
              <div className="flex-1 font-medium">Confirmation</div>
            </div>
          </div>
          
          {/* Success Message */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
              <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Payment Received!</h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Thank you for your order. Our artists will create your coloring pages within 24 hours.
              You will receive an email when your coloring pages are ready.
            </p>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-8 text-left">
              <h3 className="text-lg font-medium mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Order Details</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order Number:</span>
                  <span className="font-mono">ORD-12345678</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Email:</span>
                  <span>client@example.com</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium">$16.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Processing
                  </span>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mt-6 mb-2">Uploaded Images:</h4>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                      Image {i}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard"
                className="rounded-full bg-black text-white dark:bg-white dark:text-black px-8 py-4 text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link 
                href="/upload"
                className="rounded-full bg-transparent border border-black dark:border-white px-8 py-4 text-lg font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Upload More Images
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 