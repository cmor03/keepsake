'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import OrderStatusBadge from '@/app/components/OrderStatusBadge';
import { formatDate } from '@/app/utils/dateUtils';

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('unfulfilled');
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    total: 0
  });

  // Memoize fetchOrders to prevent recreation on each render
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let url;
      
      if (statusFilter === 'unfulfilled') {
        // Custom filter for unfulfilled orders (pending or processing)
        url = '/api/admin/orders';
      } else {
        url = statusFilter 
          ? `/api/admin/orders?status=${statusFilter}` 
          : '/api/admin/orders';
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      // If unfulfilled filter is active, filter orders on client side
      let filteredOrders = data.orders;
      if (statusFilter === 'unfulfilled') {
        filteredOrders = data.orders.filter(
          order => order.status === 'pending' || order.status === 'processing'
        );
      }
      
      // Calculate stats
      const allOrders = data.orders;
      const stats = {
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        total: allOrders.length
      };
      setStats(stats);
      
      // Sort orders to prioritize pending first, then processing
      filteredOrders.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        // If same status or neither is pending, sort by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setOrders(filteredOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    document.title = 'Admin Dashboard';
    fetchOrders();
  }, [fetchOrders]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      // Refresh the orders after update
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  }, [fetchOrders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Order stats at a glance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="font-medium text-yellow-800">Pending</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="font-medium text-blue-800">Processing</div>
          <div className="text-2xl font-bold text-blue-700">{stats.processing}</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="font-medium text-green-800">Completed</div>
          <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
          <div className="font-medium text-gray-800">Total Orders</div>
          <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="text-gray-600">Manage and fulfill customer orders</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
              Filter by status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            >
              <option value="unfulfilled">Unfulfilled (Pending + Processing)</option>
              <option value="">All orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No orders found with the selected filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`hover:bg-gray-50 ${
                    order.status === 'pending' 
                      ? 'bg-yellow-50' 
                      : order.status === 'processing' 
                        ? 'bg-blue-50' 
                        : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.name || order.user?.email || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.imageCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        → Processing
                      </button>
                    )}
                    
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="text-green-600 hover:text-green-800 ml-2"
                      >
                        → Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 