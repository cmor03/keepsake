'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import OrderStatusBadge from '@/app/components/OrderStatusBadge';
import { formatDate } from '@/app/utils/dateUtils';

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
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
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Refresh the order data
      fetchOrder();
    } catch (err) {
      setError(err.message);

    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUploadTransformedImage = async (originalImageId, file) => {
    try {
      setUploadingImage(originalImageId);
      
      const formData = new FormData();
      formData.append('originalImageId', originalImageId);
      formData.append('file', file);
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload transformed image');
      }

      // Refresh the order data
      fetchOrder();
    } catch (err) {
      setError(err.message);

    } finally {
      setUploadingImage(null);
    }
  };

  const handleFileChange = (e, imageId) => {
    const file = e.target.files[0];
    if (file) {
      handleUploadTransformedImage(imageId, file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Order not found</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Order Status:</span>
          <OrderStatusBadge status={order.status} />
          
          <div className="ml-4">
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value)}
              disabled={statusUpdating}
              className="border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p className="text-gray-600">
                <span className="font-medium">Customer:</span> {order.user?.name || order.user?.email || 'Unknown User'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Total:</span> ${order.totalAmount?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Images ({order.images?.length || 0})
          </h2>
          
          {!order.images || order.images.length === 0 ? (
            <p className="text-gray-500 italic">No images available</p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {order.images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{image.name}</h3>
                      <p className="text-sm text-gray-500">
                        Uploaded: {formatDate(image.dateUploaded)}
                      </p>
                    </div>
                    
                    <div>
                      {!image.transformedImage && (
                        <>
                          <input
                            type="file"
                            id={`file-${image.id}`}
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, image.id)}
                          />
                          <button
                            onClick={() => document.getElementById(`file-${image.id}`).click()}
                            disabled={uploadingImage === image.id}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:bg-blue-300"
                          >
                            {uploadingImage === image.id ? 'Uploading...' : 'Upload Transformed Image'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Original</p>
                      {image.originalImageUrl ? (
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={image.originalImageUrl}
                            alt={`Original ${image.name}`}
                            fill
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
                          <p className="text-gray-400">No image available</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Transformed</p>
                      {image.transformedImage ? (
                        <div className="relative h-64 bg-gray-100 rounded">
                          <Image
                            src={`/api/uploads/transformed/${image.transformedImage}`}
                            alt={`Transformed ${image.name}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 h-64 flex items-center justify-center rounded">
                          <p className="text-gray-400">Not uploaded yet</p>
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