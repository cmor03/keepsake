'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { redirectToAdmin } from '../admin-redirect';

export default function AdminRedirect() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {

    setLogs(prev => [...prev, message]);
  };
  
  useEffect(() => {
    addLog('Admin redirect page loaded');
    
    // Try both methods to cover all bases
    try {
      addLog('Attempting redirection with router.push');
      router.push('/admin/dashboard');
      
      // After a short delay, try window.location as a fallback
      setTimeout(() => {
        addLog('Fallback: Using window.location');
        window.location.href = '/admin/dashboard';
      }, 500);
    } catch (error) {
      addLog(`Redirect error: ${error.message}`);
      
      // Use the utility as a last resort
      addLog('Last resort: Using redirect utility');
      redirectToAdmin();
    }
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Redirecting to admin dashboard...</p>
      
      {/* Debug logs */}
      <div className="mt-8 w-full max-w-md">
        <div className="text-xs font-mono bg-gray-100 p-3 rounded overflow-auto max-h-40">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
} 