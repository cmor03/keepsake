'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { formatDate } from '@/app/utils/dateUtils';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
    active: 0,
    inactive: 0
  });

  // Fetch users with filters and pagination
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (roleFilter) {
        url += `&role=${roleFilter}`;
      }
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users);
      setFilteredUsers(data.users);
      setPagination({
        ...pagination,
        total: data.total
      });
      
      // Calculate stats
      const stats = {
        total: data.total || data.users.length,
        admins: data.users.filter(user => user.isAdmin).length,
        active: data.users.filter(user => user.isActive).length,
        inactive: data.users.filter(user => !user.isActive).length
      };
      setUserStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, roleFilter, statusFilter]);

  useEffect(() => {
    document.title = 'Admin - Users';
    fetchUsers();
  }, [fetchUsers]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = users.filter(user => 
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.name && user.name.toLowerCase().includes(query))
    );
    
    setFilteredUsers(results);
  }, [searchQuery, users]);

  // Update user role/status
  const updateUser = async (userId, updates) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      // Refresh the users list
      fetchUsers();
      
      // Update current user if in modal
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({
          ...currentUser,
          ...updates
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      // Process each selected user
      await Promise.all(
        selectedUsers.map(userId => {
          let updates = {};
          
          if (bulkAction === 'makeAdmin') {
            updates = { isAdmin: true };
          } else if (bulkAction === 'removeAdmin') {
            updates = { isAdmin: false };
          } else if (bulkAction === 'activate') {
            updates = { isActive: true };
          } else if (bulkAction === 'deactivate') {
            updates = { isActive: false };
          }
          
          return fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
        })
      );
      
      // Reset selections and refresh
      setSelectedUsers([]);
      setBulkAction('');
      fetchUsers();
    } catch (err) {
      setError(`Bulk action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle select all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Toggle select single user
  const toggleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle pagination
  const goToPage = (page) => {
    setPagination({
      ...pagination,
      page: page
    });
  };

  // Open user detail modal
  const openUserModal = (user) => {
    setCurrentUser(user);
    setUserModalOpen(true);
  };

  // Close user detail modal
  const closeUserModal = () => {
    setUserModalOpen(false);
    setCurrentUser(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">View and manage user accounts</p>
        </div>
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {/* User stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <div className="font-medium text-indigo-800">Total Users</div>
          <div className="text-2xl font-bold text-indigo-700">{userStats.total}</div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="font-medium text-purple-800">Admin Users</div>
          <div className="text-2xl font-bold text-purple-700">{userStats.admins}</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="font-medium text-green-800">Active Users</div>
          <div className="text-2xl font-bold text-green-700">{userStats.active}</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
          <div className="font-medium text-gray-800">Inactive Users</div>
          <div className="text-2xl font-bold text-gray-700">{userStats.inactive}</div>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Email or name"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">Regular User</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('');
              setStatusFilter('');
              setPagination({...pagination, page: 1});
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            Reset Filters
          </button>
          
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Bulk Action...</option>
                <option value="makeAdmin">Make Admin</option>
                <option value="removeAdmin">Remove Admin</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || isProcessing}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  !bulkAction || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Apply'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Users list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No users found with the selected filters</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-3 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold uppercase">
                            {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.orderCount || 0}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isAdmin
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openUserModal(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        <div className="text-gray-300">|</div>
                        <div className="relative group">
                          <button className="text-gray-600 hover:text-gray-900">
                            Actions ▼
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                            <div className="py-1">
                              {user.isAdmin ? (
                                <button
                                  onClick={() => updateUser(user.id, { isAdmin: false })}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Remove Admin Role
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUser(user.id, { isAdmin: true })}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Make Admin
                                </button>
                              )}
                              
                              {user.isActive ? (
                                <button
                                  onClick={() => updateUser(user.id, { isActive: false })}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Deactivate Account
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUser(user.id, { isActive: true })}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  Activate Account
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === Math.ceil(pagination.total / pagination.limit)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* User Detail Modal */}
      {userModalOpen && currentUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium">User Details</h3>
              <button 
                onClick={closeUserModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-2xl uppercase">
                      {currentUser.name ? currentUser.name.charAt(0) : currentUser.email.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-medium">{currentUser.name || 'No Name'}</h4>
                      <p className="text-gray-600">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Account Status</h5>
                      <div className="flex justify-between">
                        <p className="text-gray-900">
                          {currentUser.isActive ? 'Active' : 'Inactive'}
                        </p>
                        <button
                          onClick={() => updateUser(currentUser.id, { isActive: !currentUser.isActive })}
                          className={`text-sm ${currentUser.isActive ? 'text-red-600' : 'text-green-600'} hover:underline`}
                        >
                          {currentUser.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Role</h5>
                      <div className="flex justify-between">
                        <p className="text-gray-900">
                          {currentUser.isAdmin ? 'Admin' : 'Regular User'}
                        </p>
                        <button
                          onClick={() => updateUser(currentUser.id, { isAdmin: !currentUser.isAdmin })}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          {currentUser.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Member Since</h5>
                      <p className="text-gray-900">{formatDate(currentUser.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Last Login</h5>
                      <p className="text-gray-900">
                        {currentUser.lastLoginAt ? formatDate(currentUser.lastLoginAt) : 'Never logged in'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Activity</h5>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <h6 className="font-medium">Orders</h6>
                        {currentUser.orderCount > 0 && (
                          <Link
                            href={`/admin/orders?userId=${currentUser.id}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            View All
                          </Link>
                        )}
                      </div>
                      <p className="text-gray-600">
                        {currentUser.orderCount > 0 
                          ? `${currentUser.orderCount} order${currentUser.orderCount === 1 ? '' : 's'}`
                          : 'No orders yet'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h6 className="font-medium">Total Spent</h6>
                      <p className="text-gray-600">
                        ${currentUser.totalSpent?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    
                    <div>
                      <h6 className="font-medium">Notes</h6>
                      <textarea
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mt-1"
                        rows="3"
                        placeholder="Add admin notes about this user"
                        value={currentUser.adminNotes || ''}
                        onChange={(e) => setCurrentUser({
                          ...currentUser,
                          adminNotes: e.target.value
                        })}
                      ></textarea>
                      <button
                        onClick={() => updateUser(currentUser.id, { adminNotes: currentUser.adminNotes })}
                        className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={closeUserModal}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 