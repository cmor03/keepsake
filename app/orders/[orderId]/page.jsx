'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '../../components/LoadingSpinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { formatDate } from '../../utils/dateUtils';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order');
        }

        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Order not found</p>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Orders
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <OrderStatusBadge status={order.status} />
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
            <p className="text-gray-600">
              Total: ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Images ({order.imageCount})
          </h2>
          
          {order.images.length === 0 ? (
            <p className="text-gray-500 italic">No images available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">{image.name}</h3>
                    <p className="text-sm text-gray-500">
                      Uploaded: {formatDate(image.dateUploaded)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 p-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Original</p>
                      {image.originalImage ? (
                        <div className="relative h-40 bg-gray-100 rounded">
                          <Image
                            src={`/api/uploads/originals/${image.originalImage}`}
                            alt={`Original ${image.name}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 h-40 flex items-center justify-center rounded">
                          <p className="text-gray-400">No image available</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Transformed</p>
                      {image.transformedImage ? (
                        <div className="relative h-40 bg-gray-100 rounded">
                          <Image
                            src={`/api/uploads/transformed/${image.transformedImage}`}
                            alt={`Transformed ${image.name}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 h-40 flex items-center justify-center rounded">
                          <p className="text-gray-400">Processing...</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {image.dateTransformed && (
                    <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
                      Transformed: {formatDate(image.dateTransformed)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 