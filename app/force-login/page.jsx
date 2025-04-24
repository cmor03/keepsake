'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForceLoginPage() {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('9XyBtJeAJ748Ssq9a4Df0V');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleForceLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/force-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secretKey }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Force login failed');
      }
      
      setResult(data);
      
      // Add a short delay before redirect
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/admin/dashboard';
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Force Admin Login</h1>
      
      <form onSubmit={handleForceLogin} className="space-y-4">
        <div>
          <label className="block mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Secret Key:</label>
          <input
            type="text"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-red-600 text-white rounded"
        >
          {loading ? 'Processing...' : 'Force Admin Login'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">
          <p><strong>Success!</strong> Redirecting to admin dashboard...</p>
          <p className="mt-2"><strong>User:</strong> {result.user?.email}</p>
          <p><strong>Admin Status:</strong> {result.user?.isAdmin ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="mt-6">
        <Link href="/login" className="text-blue-600">Back to login</Link>
      </div>
    </div>
  );
} 