import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-8 sm:px-16 md:px-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Turn every listing into a kids&apos; coloring adventure.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
              Create memorable marketing materials that parents love and kids enjoy. Stand out with personalized coloring pages from your listings.
            </p>
            <Link 
              href="/upload"
              className="rounded-full bg-black text-white dark:bg-white dark:text-black px-8 py-4 text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Upload Images
            </Link>
          </div>
          <div className="flex-1">
            <div className="relative w-full aspect-[4/3] max-w-xl mx-auto md:mx-0">
              <Image 
                src="/hero-image.png" 
                alt="House photo transformed into coloring page" 
                fill
                className="object-cover rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Steps Section */}
      <section className="py-20 px-8 sm:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Upload",
                description: "Upload your listing photos through our simple interface."
              },
              {
                step: 2,
                title: "Confirm Order",
                description: "Quick and secure payment with multiple options available."
              },
              {
                step: 3, 
                title: "We Hand-Craft",
                description: "Our team transform your photos into beautiful coloring pages."
              },
              {
                step: 4,
                title: "Download & Delight",
                description: "Get your coloring pages and share them with clients."
              }
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Before/After Samples */}
      <section className="py-20 px-8 sm:px-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Sample Transformations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square">
                      <Image
                        src={`/sample-before-${i}.jpeg`}
                        alt="Original photo"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Before
                      </div>
                    </div>
                    <div className="relative aspect-square">
                      <Image
                        src={`/sample-after-${i}.png`}
                        alt="Coloring page version"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 px-8 sm:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">What Real Estate Agents Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Luxury Home Specialist",
                quote: "My clients absolutely love the personalized coloring books. It's become my signature closing gift for families."
              },
              {
                name: "Michael Rodriguez",
                role: "Realtor®, Central Realty",
                quote: "The coloring pages are a hit at open houses. Parents appreciate the thoughtful activity for their kids."
              },
              {
                name: "Jessica Williams",
                role: "Team Lead, Coastal Properties",
                quote: "This service has helped me stand out in a competitive market. Worth every penny for the unique marketing edge."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <div className="flex flex-col h-full">
                  <svg width="45" height="36" className="mb-6 text-gray-300" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0C6.04416 0 0 6.04416 0 13.5C0 20.9558 6.04416 27 13.5 27H18V36H9C4.02944 36 0 31.9706 0 27V13.5C0 6.04416 6.04416 0 13.5 0ZM40.5 0C33.0442 0 27 6.04416 27 13.5C27 20.9558 33.0442 27 40.5 27H45V36H36C31.0294 36 27 31.9706 27 27V13.5C27 6.04416 33.0442 0 40.5 0Z" fill="currentColor"/>
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 flex-grow mb-6">{item.quote}</p>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.role}</p>
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
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to delight your clients?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Create memorable marketing materials that set you apart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/upload"
              className="rounded-full bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Get Started Now
            </Link>
            <Link 
              href="/pricing"
              className="rounded-full bg-transparent border border-white px-8 py-4 text-lg font-medium hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
          <div className="mt-12 flex justify-center">
            <Image 
              src="/stripe-badge.png" 
              alt="Secure payments powered by Stripe" 
              width={120} 
              height={40} 
            />
          </div>
        </div>
      </section>
    </>
  );
}
