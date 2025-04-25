'use client';

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function ClientHeader() {
  const { isLoaded, userId } = useAuth();
  
  return (
    <header className="flex items-center justify-between py-4 px-8 sm:px-16 border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[var(--primary)]">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="font-semibold text-xl tracking-tight text-[var(--foreground)]">Keepsake</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/how-it-works" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
          How It Works
        </Link>
        <Link href="/pricing" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
          Pricing
        </Link>
      </nav>
      
      <div className="flex items-center gap-4">
        {isLoaded && userId ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
              Dashboard
            </Link>
            <Link href="/upload" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors">
              Create
            </Link>
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <>
            <Link 
              href="/sign-in"
              className="etsy-button-secondary text-sm h-10 px-5 py-2 flex items-center justify-center"
            >
              Sign in
            </Link>
            <Link 
              href="/sign-up"
              className="etsy-button-primary px-5 py-2 text-sm"
            >
              Register
            </Link>
          </>
        )}
        
        <button className="md:hidden text-[var(--secondary)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
} 