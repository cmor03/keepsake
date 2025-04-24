'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import OrderStatusBadge from '@/app/components/OrderStatusBadge';
import { formatDate } from '@/app/utils/dateUtils';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightImageId = searchParams.get('highlightImage');
  const { isLoaded, userId, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  
  const [orders, setOrders] = useState([]);
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [mongoConnected, setMongoConnected] = useState(true);

  useEffect(() => {
    // Don't fetch data until Clerk auth is loaded
    if (!isLoaded) return;
    
    // Redirect to sign-in if not signed in
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }
    
    // Immediately set user data from Clerk if available
    if (clerkUser) {
      setUser({
        name: clerkUser.fullName || clerkUser.firstName || 'Keepsake User',
        email: clerkUser.primaryEmailAddress?.emailAddress || 'User'
      });
    }
    
    async function fetchData() {
      try {
        // First, sync the user data from Clerk to our MongoDB
        await fetch('/api/user/sync', {
          method: 'POST'
        });
        
        // Then fetch user data and orders from our API endpoint
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();

        if (!userResponse.ok) {
          if (userResponse.status === 500) {
            // MongoDB connection issue - use Clerk data instead
            setMongoConnected(false);
            setOrders([]);
            setCreations([]);
            // We already set user data from Clerk above
          } else {
            throw new Error(userData.error || 'Failed to fetch user data');
          }
        } else {
          // MongoDB is connected, use its data
          setMongoConnected(true);
          setUser(userData.user);
          setOrders(userData.orders || []);
          
          // Extract all images/creations from orders
          const allCreations = [];
          userData.orders.forEach(order => {
            if (order.images && order.images.length > 0) {
              order.images.forEach(image => {
                if (image.transformedImage) {
                  const creation = {
                    id: image._id,
                    name: image.name,
                    originalImage: image.originalImage,
                    transformedImage: image.transformedImage,
                    dateTransformed: image.dateTransformed,
                    orderId: order.id,
                    orderNumber: order.orderNumber
                  };
                  
                  allCreations.push(creation);
                  
                  // Check if this image should be highlighted (recently added)
                  if (highlightImageId && highlightImageId === image._id) {
                    setNewImages([image._id]);
                  }
                }
              });
            }
          });
          
          // Filter out creations with missing IDs before setting state
          const validCreations = allCreations.filter(creation => creation.id !== null && creation.id !== undefined);
          setCreations(validCreations);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        // Don't set error - use Clerk data instead
        setMongoConnected(false);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [router, highlightImageId, isLoaded, isSignedIn, userId, clerkUser]);

  const handleDownload = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'keepsake-coloring-page.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Wait for Clerk to initialize
  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your orders and creations</p>
        </header>
        
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden mb-12">
          <div className="px-8 py-8 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Welcome, {user?.name || user?.email}</h2>
            <p className="text-gray-600 max-w-2xl">
              Transform your real estate listings into delightful coloring experiences for families. View your order history or create something new below.
            </p>
          </div>
          
          {!mongoConnected && (
            <div className="px-8 py-4 bg-yellow-50 border-b border-yellow-100">
              <div className="flex items-center text-yellow-800">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm">
                  We're experiencing some technical difficulties connecting to our database. Your past orders and creations may not be visible right now, but you can still create new ones.
                </p>
              </div>
            </div>
          )}
          
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Ready to create more?</p>
                <p className="mt-1 text-gray-600">Turn your listing photos into coloring adventures</p>
              </div>
              <Link 
                href="/upload" 
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
              >
                Upload New Images
              </Link>
            </div>
          </div>
        </div>
        
        {/* Your Creations Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-2xl font-medium text-gray-900">Your Creations</h2>
            {creations.length > 0 && (
              <span className="mt-2 sm:mt-0 text-sm font-medium text-gray-500">{creations.length} {creations.length === 1 ? 'creation' : 'creations'}</span>
            )}
          </div>
          
          {creations.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No creations yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Once your images are transformed into coloring pages, they will appear here for easy access and download.
              </p>
              <Link 
                href="/upload" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
              >
                Create Your First Coloring Page
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creations.map((creation) => {
                const isNew = newImages.includes(creation.id);
                
                return (
                  <div 
                    key={String(creation.id)}
                    className={`bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 ${
                      isNew ? 'animate-bounce-once ring-4 ring-indigo-500 ring-opacity-50' : ''
                    }`}
                  >
                    <div className="relative pt-[100%] bg-gray-50">
                      <Image
                        src={`/api/uploads/transformed/${creation.transformedImage}`}
                        alt={creation.name || "Coloring page"}
                        fill
                        className={`object-contain p-2 ${isNew ? 'animate-fade-in' : ''}`}
                      />
                      <button
                        onClick={() => handleDownload(`/api/uploads/transformed/${creation.transformedImage}`, `${creation.name || 'coloring-page'}.png`)}
                        className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                        aria-label="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">
                        {creation.name || "Untitled Creation"}
                        {isNew && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">New</span>}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        From Order #{creation.orderNumber}
                      </p>
                      {creation.dateTransformed && (
                        <p className="text-xs text-gray-400 mt-1">
                          Created {formatDate(creation.dateTransformed)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-2xl font-medium text-gray-900">Your Orders</h2>
            {orders.length > 0 && (
              <span className="mt-2 sm:mt-0 text-sm font-medium text-gray-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
            )}
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                You haven't placed any orders yet. Start by uploading images to create your first coloring pages.
              </p>
              <Link 
                href="/upload" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
              >
                Create Your First Order
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">{order.orderNumber}</h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Images</span>
                        <p className="mt-1 text-sm font-medium text-gray-900">{order.imageCount}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Total</span>
                        <p className="mt-1 text-sm font-medium text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4">
                    <Link 
                      href={`/orders/${order.id}`} 
                      className="block w-full text-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Need Help?</h2>
          </div>
          <div className="px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-gray-600">
                  Have questions or need assistance with your orders? Our team is here to help.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 