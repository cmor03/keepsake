'use client';

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function ClientHeader() {
  const { isLoaded, userId } = useAuth();
  
  return (
    <header className="flex items-center justify-between py-6 px-8 sm:px-16">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="font-semibold text-xl tracking-tight">Keepsake</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8">
        <Link href="/how-it-works" className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          How It Works
        </Link>
        <Link href="/pricing" className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Pricing
        </Link>
      </nav>
      
      <div className="flex items-center gap-4">
        {isLoaded && userId ? (
          <>
            <Link href="/dashboard" className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/upload" className="text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Upload Images
            </Link>
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <>
            <Link 
              href="/sign-in"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-5"
            >
              Login
            </Link>
            <Link 
              href="/sign-up"
              className="rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
        
        <button className="md:hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
} 