import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-8 sm:px-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Client Login</h1>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Magic Link Option */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4">Login with Magic Link</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                  />
                </div>
                <button 
                  className="w-full rounded-lg bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Send Magic Link
                </button>
                <p className="text-xs text-gray-500 text-center">
                  We&apos;ll email you a magic link for a password-free sign in.
                </p>
              </div>
            </div>
            
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* Password Option */}
            <div>
              <h2 className="text-lg font-medium mb-4">Login with Password</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-black rounded focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm">
                      Remember me
                    </label>
                  </div>
                  <div>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <Link 
                  href="/dashboard"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link 
              href="/upload" 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Start by placing an order
            </Link>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 