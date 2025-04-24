import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-8 sm:px-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            How Keepsake Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Transform your real estate listings into charming, personalized coloring pages in four simple steps.
          </p>
        </div>
      </section>
      
      {/* Process Steps */}
      <section className="py-20 px-8 sm:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black text-xl font-bold mb-6">
                1
              </div>
              <h2 className="text-3xl font-bold mb-6">Upload Your Listing Photos</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Select and upload high-quality photos of your real estate listings. Our platform accepts all standard image formats (JPG, PNG) up to 20MB per image.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Upload multiple images in one session
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Exterior and interior shots work equally well
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Clear, well-lit photos produce the best results
                </li>
              </ul>
              <Link 
                href="/upload"
                className="rounded-full bg-black text-white dark:bg-white dark:text-black px-6 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors inline-block"
              >
                Upload Images
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative w-full aspect-[4/3] max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400">
                  <Image
                    src="/upload-console.png"
                    alt="Upload interface showing drag and drop area"
                    fill
                    className="object-cover rounded-2xl shadow-lg" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="relative w-full aspect-[4/3] max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400">
                  Payment Process Image
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black text-xl font-bold mb-6">
                2
              </div>
              <h2 className="text-3xl font-bold mb-6">Secure Payment Process</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Pay securely through our Stripe-powered checkout system. Each image is $5, with volume discounts available for larger orders.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  All major credit cards accepted
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Apple Pay and Google Pay supported
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Bank-level encryption for all transactions
                </li>
              </ul>
              <Link 
                href="/pricing"
                className="rounded-full bg-transparent border border-black dark:border-white px-6 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors inline-block"
              >
                View Pricing
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black text-xl font-bold mb-6">
                3
              </div>
              <h2 className="text-3xl font-bold mb-6">Artistic Transformation</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Our team of skilled artists carefully transforms your photos into beautifully designed coloring pages, maintaining the distinctive features of each property.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Hand-crafted by professional artists
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Perfect balance of detail and simplicity
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Quality review before delivery
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative w-full aspect-[4/3] max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400">
                  <Image
                      src="/sample-after-1.png"
                      alt="Upload interface showing drag and drop area"
                      fill
                      className="object-cover rounded-2xl shadow-lg" 
                    />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="relative w-full aspect-[4/3] max-w-xl mx-auto">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400">
                <Image
                    src="/dashboard.png"
                    alt="Upload interface showing drag and drop area"
                    fill
                    className="object-cover rounded-2xl shadow-lg" 
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black text-xl font-bold mb-6">
                4
              </div>
              <h2 className="text-3xl font-bold mb-6">Download & Delight</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Within 24 hours, your coloring pages will be ready for download from your dashboard. Each image is delivered in both PDF and PNG formats for maximum flexibility.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Print-ready high-resolution files
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Email notification when ready
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Permanent access in your account
                </li>
              </ul>
              <Link 
                href="/login"
                className="rounded-full bg-transparent border border-black dark:border-white px-6 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors inline-block"
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 px-8 sm:px-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Clients Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "I've handed these out at open houses and gotten incredible feedback. Parents appreciate having something to keep their kids occupied during the tour, and it creates a lasting memento of the home.",
                name: "Jennifer Lee",
                role: "Broker, Pacific Homes"
              },
              {
                quote: "The coloring pages make for an incredible touch in my listing presentation kit. Sellers are always impressed by this creative marketing approach that helps their home stand out.",
                name: "Marcus Johnson",
                role: "Luxury Home Specialist"
              },
              {
                quote: "I order coloring pages for every family home I sell and include them in my closing gifts. It's become my signature touch that clients remember and tell others about.",
                name: "Priya Sharma",
                role: "Real Estate Agent, Golden State Realty"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <div className="flex flex-col h-full">
                  <svg width="45" height="36" className="mb-6 text-gray-300" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0C6.04416 0 0 6.04416 0 13.5C0 20.9558 6.04416 27 13.5 27H18V36H9C4.02944 36 0 31.9706 0 27V13.5C0 6.04416 6.04416 0 13.5 0ZM40.5 0C33.0442 0 27 6.04416 27 13.5C27 20.9558 33.0442 27 40.5 27H45V36H36C31.0294 36 27 31.9706 27 27V13.5C27 6.04416 33.0442 0 40.5 0Z" fill="currentColor"/>
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 flex-grow mb-6">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-8 sm:px-16 bg-black text-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to create unique marketing materials?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Start transforming your listing photos into memorable coloring pages today.
          </p>
          <Link 
            href="/upload"
            className="rounded-full bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </>
  );
} 