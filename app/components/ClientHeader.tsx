'use client';

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function ClientHeader() {
  const { isLoaded, userId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="relative">
      <div className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-8 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[var(--primary)]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-lg sm:text-xl tracking-tight text-[var(--foreground)]">Keepsake</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/how-it-works" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
            How It Works
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
            Pricing
          </Link>
        </nav>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {isLoaded && userId ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline-block text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
                Dashboard
              </Link>
              <Link href="/upload" className="hidden sm:inline-block text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
                Create
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link 
                href="/sign-in"
                className="etsy-button-secondary text-sm h-8 sm:h-10 px-3 sm:px-5 py-1 sm:py-2 flex items-center justify-center"
              >
                Sign in
              </Link>
              <Link 
                href="/sign-up"
                className="etsy-button-primary px-3 sm:px-5 py-1 sm:py-2 text-sm"
              >
                Register
              </Link>
            </>
          )}
          
          <button 
            className="md:hidden text-[var(--secondary)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 z-50 border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <nav className="flex flex-col py-2">
            <Link 
              href="/how-it-works" 
              className="px-4 py-3 text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/pricing" 
              className="px-4 py-3 text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            
            {isLoaded && userId && (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-3 text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/upload" 
                  className="px-4 py-3 text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
} 