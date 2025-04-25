import React from "react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-8 sm:px-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Create memorable marketing materials that stand out without breaking your budget.
            </p>
          </div>
        </section>
        
        {/* Pricing Table */}
        <section className="py-20 px-8 sm:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="px-8 py-12 sm:px-16 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold mb-6">Pay Per Image</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
                  Each image is individually hand-crafted by our professional artists, maintaining the perfect balance of detail and simplicity for an engaging coloring experience.
                </p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">$5</span>
                  <span className="text-xl text-gray-500 ml-2">per image</span>
                </div>
              </div>
              
              <div className="px-8 py-12 sm:px-16">
                <h3 className="text-xl font-bold mb-8">What&apos;s Included</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                  <div className="flex">
                    <svg className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <h4 className="font-medium">Hand-crafted Artwork</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Each image is carefully transformed by our skilled artists</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <svg className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <h4 className="font-medium">Multiple Formats</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Both high-resolution PDF and PNG formats included</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <svg className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <h4 className="font-medium">24-Hour Turnaround</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Receive your finished coloring pages within one business day</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <svg className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <h4 className="font-medium">Unlimited Access</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Download your coloring pages anytime from your dashboard</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <svg className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <h4 className="font-medium">Commercial Usage Rights</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Full rights to use in your marketing materials</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <svg className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div>
                      <h4 className="font-medium">Satisfaction Guaranteed</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Not happy? We&apos;ll make it right or refund your payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Volume Discounts */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Volume Discounts</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { quantity: "5-9", discount: "10%", price: "$4.50" },
                  { quantity: "10-24", discount: "15%", price: "$4.25" },
                  { quantity: "25-49", discount: "20%", price: "$4.00" },
                  { quantity: "50+", discount: "25%", price: "$3.75" }
                ].map((tier, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <h3 className="font-bold text-lg">{tier.quantity} Images</h3>
                    <div className="text-3xl font-bold my-4">{tier.discount} <span className="text-sm text-gray-500">off</span></div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{tier.price} per image</p>
                    <p className="text-sm text-gray-500">Savings applied automatically</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Enterprise */}
            <div className="mt-16 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 sm:p-12 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Need a custom package?</h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                    Real estate teams, brokerages, and high-volume agents can benefit from our custom enterprise packages. Contact us to discuss your specific needs.
                  </p>
                </div>
                <Link 
                  href="/contact"
                  className="whitespace-nowrap rounded-full bg-black text-white dark:bg-white dark:text-black px-8 py-3 text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 px-8 sm:px-16 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-8">
              {[
                {
                  question: "How quickly will I receive my coloring pages?",
                  answer: "We strive to deliver all coloring pages within 24 hours of your order. For large orders (10+ images), it may take up to 48 hours. You'll receive an email notification as soon as your coloring pages are ready."
                },
                {
                  question: "Can I request edits to my coloring pages?",
                  answer: "Yes! If you'd like changes to your coloring pages, we offer one round of revisions at no additional charge. Simply contact us within 7 days of delivery with your specific requests."
                },
                {
                  question: "What type of images work best for coloring pages?",
                  answer: "Clear, well-lit photos of properties work best. Both exterior and interior shots can be transformed into engaging coloring pages. We recommend images that showcase distinctive features of the property."
                },
                {
                  question: "How do I use these coloring pages in my marketing?",
                  answer: "Our clients use coloring pages in various ways: as handouts at open houses, closing gifts for families, digital downloads on property websites, social media content, and even as part of direct mail campaigns to neighborhoods with families."
                },
                {
                  question: "Is there a limit to how many images I can upload?",
                  answer: "There's no limit to the number of images you can upload. Volume discounts are automatically applied based on the number of images in your order."
                }
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-8">
                  <h3 className="text-xl font-bold mb-4">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-8 sm:px-16 bg-black text-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Create your first coloring page today and see the difference it makes in your marketing.
            </p>
            <Link 
              href="/upload"
              className="rounded-full bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Upload Your First Image
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
} 