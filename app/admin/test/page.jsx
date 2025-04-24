'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminTest() {
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get user data from API
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (response.ok && data.success) {
          setAuthState('authenticated');
          setUser(data.user);
        } else {
          setAuthState('unauthenticated');
          setError(data.error || 'Authentication failed');
        }
      } catch (err) {
        setAuthState('error');
        setError(err.message);
      }
    }

    checkAuth();
  }, []);

  // Function to manually redirect to admin dashboard using different methods
  const testRedirect = (method) => {
    try {
      if (method === 'router') {
        router.push('/admin/dashboard');
      } else if (method === 'window') {
        window.location.href = '/admin/dashboard';
      } else if (method === 'document') {
        document.location.href = '/admin/dashboard';
      } else if (method === 'assign') {
        window.location.assign('/admin/dashboard');
      } else if (method === 'replace') {
        window.location.replace('/admin/dashboard');
      }
    } catch (err) {
      // Ignore errors
    }
  };

  // Function to manually update the token cookie
  const refreshToken = async () => {
    try {
      // Re-fetch from /me endpoint to ensure our cookie is fresh
      await fetch('/api/auth/me');
      checkAuth();
    } catch (err) {
      // Ignore errors
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Authentication Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p className="mb-2">
          Status: <span className={
            authState === 'authenticated' ? 'text-green-600 font-semibold' : 
            authState === 'unauthenticated' ? 'text-red-600 font-semibold' : 
            'text-yellow-600 font-semibold'
          }>
            {authState}
          </span>
        </p>
        
        {user && (
          <div className="mt-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name || 'Not set'}</p>
            <p>
              <strong>Admin Status:</strong>{' '}
              <span className={user.isAdmin ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {user.isAdmin ? 'Is Admin' : 'Not Admin'}
              </span>
            </p>
            <p><strong>Admin Type:</strong> {typeof user.isAdmin}</p>
          </div>
        )}
        
        {error && (
          <div className="mt-2 p-3 bg-red-50 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Redirection Methods</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => testRedirect('router')} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Router Push
          </button>
          <button 
            onClick={() => testRedirect('window')} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            window.location
          </button>
          <button 
            onClick={() => testRedirect('document')} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            document.location
          </button>
          <button 
            onClick={() => testRedirect('assign')} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            location.assign
          </button>
          <button 
            onClick={() => testRedirect('replace')} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            location.replace
          </button>
          <button 
            onClick={refreshToken} 
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Refresh Token
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <Link href="/login" className="px-4 py-2 bg-gray-600 text-white rounded-md inline-block">
          Back to Login
        </Link>
      </div>
    </div>
  );
} 