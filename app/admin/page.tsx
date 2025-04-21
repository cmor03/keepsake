import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-8 sm:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage orders and track performance</p>
            </div>
          </div>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                title: "New Orders", 
                value: "12", 
                change: "+33%",
                changeType: "positive" 
              },
              { 
                title: "Processing", 
                value: "8", 
                change: "-10%",
                changeType: "negative" 
              },
              { 
                title: "Today's Revenue", 
                value: "$128", 
                change: "+21%",
                changeType: "positive" 
              },
              { 
                title: "Avg. Turnaround", 
                value: "6.2hrs", 
                change: "-8%",
                changeType: "positive" 
              }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold mt-2 mb-1">{stat.value}</p>
                <div className={`text-sm ${
                  stat.changeType === "positive" 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {stat.change} from last week
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Management Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button className="border-b-2 border-black dark:border-white px-1 py-4 text-sm font-medium">
                Order Queue
              </button>
              <button className="border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Analytics
              </button>
              <button className="border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Settings
              </button>
            </nav>
          </div>
          
          {/* Queue Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-medium">New Order Queue</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="text-sm border-0 py-1 pl-2 pr-8 rounded bg-gray-100 dark:bg-gray-700">
                  <option>Newest first</option>
                  <option>Oldest first</option>
                  <option>Expiring soon</option>
                </select>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {
                    id: "ORD-12345678",
                    client: "sarah@realestate.com",
                    images: 3,
                    status: "New",
                    statusColor: "blue",
                    deadline: "4h 32m remaining"
                  },
                  {
                    id: "ORD-12345679",
                    client: "mike@homes.com",
                    images: 2,
                    status: "New",
                    statusColor: "blue",
                    deadline: "7h 15m remaining"
                  },
                  {
                    id: "ORD-12345680",
                    client: "jessica@property.com",
                    images: 5,
                    status: "In Progress",
                    statusColor: "yellow",
                    deadline: "2h 45m remaining",
                    assignedTo: "Julia"
                  },
                  {
                    id: "ORD-12345681",
                    client: "robert@realtor.com",
                    images: 1,
                    status: "Ready for Review",
                    statusColor: "purple",
                    deadline: "30m remaining",
                    assignedTo: "David"
                  }
                ].map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.images} images
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${order.statusColor === "blue" 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                            : order.statusColor === "yellow"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          }`}>
                          {order.status}
                        </span>
                        {order.assignedTo && (
                          <span className="ml-2 text-xs text-gray-500">
                            by {order.assignedTo}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.deadline}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex justify-center gap-2">
                        {order.status === "New" ? (
                          <button className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            Claim
                          </button>
                        ) : order.status === "In Progress" ? (
                          <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                            Submit
                          </button>
                        ) : (
                          <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                            Approve
                          </button>
                        )}
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Recent Activity */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <ul className="space-y-6">
                {[
                  {
                    user: "David",
                    action: "uploaded 3 rendered coloring pages",
                    orderId: "ORD-12345678",
                    time: "10 minutes ago"
                  },
                  {
                    user: "Julia",
                    action: "marked order as in progress",
                    orderId: "ORD-12345680",
                    time: "25 minutes ago"
                  },
                  {
                    user: "Admin",
                    action: "processed payment",
                    orderId: "ORD-12345681",
                    time: "1 hour ago"
                  },
                  {
                    user: "David",
                    action: "claimed order for processing",
                    orderId: "ORD-12345681",
                    time: "1 hour ago"
                  }
                ].map((activity, i) => (
                  <li key={i} className="flex items-start">
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium mr-3">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action} for{" "}
                        <Link 
                          href={`/admin/orders/${activity.orderId}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {activity.orderId}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 