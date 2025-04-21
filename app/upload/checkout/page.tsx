import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-8 sm:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <div className="text-sm text-gray-500">Step 2 of 3</div>
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
                <div className="w-6 h-6 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center mx-auto">
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
                <div className="h-full w-full bg-black dark:bg-white"></div>
              </div>
              <div className="flex-1 h-full">
                <div className="h-full w-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
            <div className="flex text-sm text-center mt-4">
              <div className="flex-1 text-gray-500">Select Images</div>
              <div className="flex-1 font-medium">Checkout</div>
              <div className="flex-1 text-gray-500">Confirmation</div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">Order Summary</h3>
              
              <div className="mb-6">
                <div className="flex justify-between py-2">
                  <span>3 images × $5.00</span>
                  <span>$15.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Processing fee</span>
                  <span>$1.00</span>
                </div>
                <div className="flex justify-between py-4 font-medium text-lg">
                  <span>Total</span>
                  <span>$16.00</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                    {/* Thumbnail preview would go here */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Image {i}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Form */}
            <div>
              <h3 className="text-lg font-medium mb-4">Payment Information</h3>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Your receipt and coloring pages will be sent to this email.
                </p>
              </div>
              
              {/* Credit Card - This would be replaced with Stripe Elements */}
              <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="mb-4">
                  <label htmlFor="card" className="block text-sm font-medium mb-2">
                    Card Number
                  </label>
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-400">
                    Stripe payment form would appear here
                  </div>
                </div>
              </div>
              
              {/* Terms Checkbox */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-black rounded focus:ring-0 focus:ring-offset-0" />
                  <span className="ml-2 text-sm">
                    I agree to the {" "}
                    <Link href="/terms" className="underline">
                      Terms of Service
                    </Link>
                    {" "} and {" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
              
              {/* Pay Button */}
              <Link
                href="/upload/confirmation"
                className="w-full rounded-full bg-black text-white dark:bg-white dark:text-black px-8 py-4 text-center text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Pay $16.00
              </Link>
              
              <div className="mt-4 flex items-center justify-center">
                <Image 
                  src="/stripe-badge.png" 
                  alt="Secure payments powered by Stripe" 
                  width={120} 
                  height={40} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 