'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, TouchEvent } from "react";
import { MouseEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Refined Carousel component
const BeforeAfterCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const totalSlides = 3; // Keep this updated if you add/remove slides
  const autoScrollInterval = 5000; // 5 seconds

  const slides = [
    {
      id: 0,
      title: "Colonial House",
      before: "/sample-before-1.jpeg",
      after: "/sample-after-1.png",
      beforeAlt: "Original colonial house photo",
      afterAlt: "Colonial house coloring page",
    },
    {
      id: 1,
      title: "Modern Farmhouse",
      before: "/sample-before-2.jpeg",
      after: "/sample-after-2.png",
      beforeAlt: "Original farmhouse photo",
      afterAlt: "Farmhouse coloring page",
    },
    {
      id: 2,
      title: "Beach House",
      before: "/sample-before-3.jpeg",
      after: "/sample-after-3.png",
      beforeAlt: "Original beach house photo",
      afterAlt: "Beach house coloring page",
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, autoScrollInterval);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Navigation handlers
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const goToPrev = () => {
    setActiveIndex((current) => (current - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % totalSlides);
  };

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Calculate the translateX value to center the active slide
  const calculateTransform = () => {
    // Mobile view: one slide takes full width
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return `translateX(-${activeIndex * 100}%)`;
    }
    
    // Tablet/Desktop: 3 slides visible with active in center
    const baseShift = activeIndex * (100 / 3);
    const centerAdjustment = 50 - (100 / 3 / 2);
    const transformPercentage = centerAdjustment - baseShift;

    return `translateX(${transformPercentage}%)`;
  };

  return (
    <div className="relative w-full overflow-hidden py-10">
      {/* Slides Container - Applies the transform */} 
      <div 
        ref={carouselRef}
        className="flex items-center transition-transform duration-700 ease-in-out" 
        style={{ transform: calculateTransform() }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render all slides */} 
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          
          return (
            <div 
              key={slide.id} 
              className={`flex-none origin-center transition-all duration-700 ease-in-out px-2 sm:px-4 ${ 
                isActive
                  ? 'scale-100 sm:scale-115 opacity-100 z-10'
                  : 'scale-95 sm:scale-85 opacity-40 sm:opacity-60'
              }`} 
              style={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : `${100 / 3}%` }}
            >
              {/* Slide Content Card */} 
              <div className="glass-card overflow-hidden">
                <div className="p-3 sm:p-4 md:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2 sm:mb-3 md:mb-4 truncate">{slide.title}</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="relative aspect-square">
                      <Image
                        src={slide.before}
                        alt={slide.beforeAlt}
                        fill
                        sizes="(max-width: 640px) 40vw, (max-width: 768px) 30vw, 15vw"
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-[var(--gray-light)]/80 text-[var(--primary)] text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium backdrop-blur-sm">
                        Before
                      </div>
                    </div>
                    <div className="relative aspect-square">
                      <Image
                        src={slide.after}
                        alt={slide.afterAlt}
                        fill
                        sizes="(max-width: 640px) 40vw, (max-width: 768px) 30vw, 15vw"
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-[var(--accent-light)]/90 text-[var(--primary)] text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium backdrop-blur-sm">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */} 
      <div className="flex justify-center items-center mt-6 sm:mt-8">
        {slides.map((slide) => (
          <button 
            key={slide.id} 
            onClick={() => goToSlide(slide.id)} 
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 mx-1.5 sm:mx-2 rounded-full transition-all duration-300 ${ 
              activeIndex === slide.id 
                ? 'bg-[var(--primary)] scale-125' 
                : 'bg-[var(--gray-medium)] opacity-50 hover:opacity-75' 
            }`} 
            aria-label={`Go to slide ${slide.id + 1}`} 
          />
        ))}
      </div>

      {/* Navigation Arrows */} 
      <button 
        onClick={goToPrev} 
        className="absolute top-1/2 left-1 sm:left-4 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full glass-button flex items-center justify-center z-20 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors" 
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button 
        onClick={goToNext} 
        className="absolute top-1/2 right-1 sm:right-4 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full glass-button flex items-center justify-center z-20 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors" 
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  );
};

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  
  // Allow all users to go to upload page from homepage
  const handleCreateClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // If not signed in, prevent default navigation and redirect to sign-in
    if (!isSignedIn) {
      e.preventDefault();
      router.push('/sign-in?redirect_url=/upload');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 px-8 sm:px-16 md:px-24 bg-[var(--background)] vision-bg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Turn every listing into a kids&apos; coloring adventure.
            </h1>
            <p className="text-xl text-[var(--secondary)] dark:text-gray-400 mb-10 max-w-2xl">
              Create memorable marketing materials that parents love and kids enjoy. Stand out with personalized coloring pages from your listings.
            </p>
            <Link 
              href="/upload"
              className="etsy-glass-primary px-8 py-4 text-lg font-medium"
              onClick={handleCreateClick}
            >
              Create
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
      <section className="py-20 px-8 sm:px-16 bg-[var(--gray-light)] dark:bg-gray-900 vision-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-[var(--secondary)] dark:text-gray-400 max-w-2xl mx-auto">
              Creating beautiful coloring pages from your listings is simple and fast.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center glass-card p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-light)] text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Your Listing Photos</h3>
              <p className="text-[var(--secondary)] dark:text-gray-400">
                Upload photos of your listings that you want transformed into coloring pages.
              </p>
            </div>
            
            <div className="text-center glass-card p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-light)] text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Magic Transformation</h3>
              <p className="text-[var(--secondary)] dark:text-gray-400">
                Our artists convert your photos into beautiful line art perfect for coloring.
              </p>
            </div>
            
            <div className="text-center glass-card p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-light)] text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Review</h3>
              <p className="text-[var(--secondary)] dark:text-gray-400">
                Each coloring page is carefully reviewed to ensure quality and accuracy.
              </p>
            </div>
            
            <div className="text-center glass-card p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-light)] text-[var(--primary)] mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Download & Delight</h3>
              <p className="text-[var(--secondary)] dark:text-gray-400">
                Download your coloring pages and share them with your clients.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Before/After Carousel Section */}
      <section className="py-20 px-8 sm:px-16 bg-[var(--background)] vision-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See the Transformation</h2>
            <p className="text-lg text-[var(--secondary)] dark:text-gray-400 max-w-2xl mx-auto">
              Browse our sample transformations from real estate listings to beautiful coloring pages.
            </p>
          </div>
          
          {/* Carousel Component */}
          <BeforeAfterCarousel />
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-8 sm:px-16 bg-[var(--gray-light)] dark:bg-gray-900 vision-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Realtors Are Saying</h2>
            <p className="text-lg text-[var(--secondary)] dark:text-gray-400 max-w-2xl mx-auto">
              Hear from real estate professionals who have used our service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8">
              <div className="flex items-center mb-4">
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-[var(--secondary)] dark:text-gray-300 mb-6">"These coloring pages have been a game-changer for my open houses. Families love them and they help my listings stand out!"</p>
              <div className="flex items-center">
                <div className="text-sm font-medium">
                  <p className="text-[var(--foreground)]">Amanda Chen</p>
                  <p className="text-[var(--gray-dark)]">Luxury Homes Specialist</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-8">
              <div className="flex items-center mb-4">
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-[var(--secondary)] dark:text-gray-300 mb-6">"My clients are blown away when I include these coloring pages in my welcome packets. It's a small touch that makes a big impression."</p>
              <div className="flex items-center">
                <div className="text-sm font-medium">
                  <p className="text-[var(--foreground)]">Derek Morales</p>
                  <p className="text-[var(--gray-dark)]">Family Homes Realtor</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-8">
              <div className="flex items-center mb-4">
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="text-[var(--primary)] w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-[var(--secondary)] dark:text-gray-300 mb-6">"The quality of these coloring pages is exceptional! They capture all the charming details of my properties and kids absolutely love them."</p>
              <div className="flex items-center">
                <div className="text-sm font-medium">
                  <p className="text-[var(--foreground)]">Lauren Baxter</p>
                  <p className="text-[var(--gray-dark)]">Residential Agent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-8 sm:px-16 bg-[var(--primary)] text-white dark:bg-[var(--primary-dark)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to delight your clients?</h2>
          <p className="text-xl text-white/90 mb-10">
            Create memorable marketing materials that set you apart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/upload"
              className="glass-button bg-white/20 backdrop-blur-md text-white rounded-full px-8 py-4 text-lg font-medium hover:bg-white/30 transition-colors"
              onClick={handleCreateClick}
            >
              Get Started Now
            </Link>
            <Link 
              href="/pricing"
              className="glass-button bg-transparent border border-white/30 rounded-full px-8 py-4 text-lg font-medium hover:bg-white/10 transition-colors"
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
