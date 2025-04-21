import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-8 sm:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your coloring page orders</p>
            </div>
            <Link 
              href="/upload"
              className="rounded-full bg-black text-white dark:bg-white dark:text-black px-6 py-3 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              New Order
            </Link>
          </div>
          
          {/* Order Filters */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button className="border-b-2 border-black dark:border-white px-1 py-4 text-sm font-medium">
                Active Orders
              </button>
              <button className="border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Completed
              </button>
              <button className="border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                All Orders
              </button>
            </nav>
          </div>
          
          {/* Orders Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {
                    id: "ORD-12345678",
                    date: "Today",
                    images: 3,
                    status: "Processing",
                    statusColor: "yellow",
                    total: "$16.00"
                  },
                  {
                    id: "ORD-23456789",
                    date: "Yesterday",
                    images: 5,
                    status: "Ready",
                    statusColor: "green",
                    total: "$26.00"
                  },
                  {
                    id: "ORD-34567890",
                    date: "Jul 15, 2023",
                    images: 2,
                    status: "Completed",
                    statusColor: "gray",
                    total: "$11.00"
                  }
                ].map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.images} images
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.statusColor === "green" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : order.statusColor === "yellow"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Ready Order Card */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Ready for Download</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Order #ORD-23456789</h3>
                    <p className="text-sm text-gray-500">Completed Yesterday</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Ready
                  </span>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="relative aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                        {i}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/orders/ORD-23456789"
                    className="flex-1 flex items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    View All
                  </Link>
                  <button 
                    className="flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 