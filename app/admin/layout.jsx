'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (res.ok && data.success && data.user.isAdmin === true) {
          setIsAdmin(true);
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminStatus();
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <div className="text-sm text-gray-700">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-black dark:text-white">
                  Keepsake
                </Link>
                <span className="ml-3 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 text-xs rounded">
                  Admin
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <Link 
                href="/"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 h-screen bg-white dark:bg-gray-800 shadow-sm fixed top-16 left-0 overflow-y-auto">
          <div className="py-4 px-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Admin Panel
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin/dashboard" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/dashboard' 
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/orders" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith('/admin/orders') 
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith('/admin/users') 
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Users
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/settings" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/settings' 
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="ml-64 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
} 