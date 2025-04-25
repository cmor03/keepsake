'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Higher-order component to protect routes that require authentication
 * Redirects to /sign-up if user is not authenticated
 */
export default function withAuth(Component) {
  return function AuthProtected(props) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      let isMounted = true;
      
      async function checkAuth() {
        try {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          
          if (!isMounted) return;
          
          if (res.ok && data.success) {
            setIsAuthenticated(true);
            setIsLoading(false);
          } else {
            // Redirect to signup if not authenticated
            setIsLoading(false);
            router.replace('/sign-up');
          }
        } catch (error) {
          if (!isMounted) return;
          
          console.error('Auth check error:', error);
          setIsLoading(false);
          router.replace('/sign-up');
        }
      }
      
      checkAuth();
      
      return () => {
        isMounted = false;
      };
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // Only render the component if authenticated
    return isAuthenticated ? <Component {...props} /> : null;
  };
} 