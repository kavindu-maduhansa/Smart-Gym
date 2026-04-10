import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const AdminOrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out orphaned orders (where user is null or name is missing)
      const validOrders = response.data.filter(order => order.user && order.user.name);
      setOrders(validOrders);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // Optimistically update UI
      setOrders(orders.map(order => order._id === id ? { ...order, status: newStatus } : order));
      
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/orders/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error updating status:", err);
      // Optional: Handle error by refetching orders to revert optimistic update
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesMethod = methodFilter === "All" || order.deliveryMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="page-bg-base overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 ambient-gradient"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="backdrop-blur-md bg-gradient-to-br from-blue-600-500/20 to-blue-600-500/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mr-3 sm:mr-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Order Management</h1>
              </div>
              <button onClick={() => navigate("/admin-dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg shadow-blue-600/20">
                Back to Dashboard
              </button>
            </div>
            <p className="text-slate-700 text-base sm:text-lg tracking-wide opacity-70">View Orders</p>
          </div>

          {/* Filters */}
          <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-600 tracking-widest mb-2">Search Orders</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by ID or Customer Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-blue-50/40 border border-slate-300 rounded-xl px-4 py-3 pl-10 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                  />
                  <svg className="w-5 h-5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-600 tracking-widest mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-blue-50/40 px-4 py-3 text-slate-900 transition focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
                >
                  <option value="All">All Status</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-600 tracking-widest mb-2">Method</label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-blue-50/40 px-4 py-3 text-slate-900 transition focus:border-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
                >
                  <option value="All">All Methods</option>
                  <option value="Home Delivery">Home Delivery</option>
                  <option value="Pickup at Counter">Pickup at Counter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/95">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-xs font-bold tracking-widest text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700">
                  {currentItems.length > 0 ? (
                    currentItems.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr
                          className="group cursor-pointer bg-white/80 transition hover:bg-slate-50 dark:bg-slate-950/30 dark:hover:bg-slate-800/50"
                          onClick={() => toggleRow(order._id)}
                        >
                          <td className="px-4 py-3 font-mono text-sm text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100">
                            <div className="flex items-center gap-2">
                              <svg className={`w-3 h-3 transition-transform ${expandedRows[order._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                              </svg>
                              {order._id}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 dark:text-slate-50">{order.user?.name || "Unknown"}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{order.user?.email || "N/A"}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider shadow-sm ${
                                order.deliveryMethod === "Pickup at Counter"
                                  ? "border-purple-200 bg-purple-100/80 text-purple-800 dark:border-purple-500/40 dark:bg-purple-950/60 dark:text-purple-100"
                                  : "border-blue-200 bg-blue-100/80 text-blue-800 dark:border-blue-500/40 dark:bg-sky-950/55 dark:text-sky-100"
                              }`}
                            >
                              {order.deliveryMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-black text-slate-900 dark:text-slate-50">
                            Rs. {order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${
                                order.status === "Delivered"
                                  ? "border-green-200 bg-green-100/80 text-green-800 dark:border-emerald-500/35 dark:bg-emerald-950/55 dark:text-emerald-100"
                                  : order.status === "Processing"
                                    ? "border-amber-200 bg-amber-100/80 text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/50 dark:text-amber-100"
                                    : "border-blue-200 bg-blue-100/80 text-blue-800 dark:border-blue-500/35 dark:bg-sky-950/50 dark:text-sky-100"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Ready for Pickup">Ready for Pickup</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                        {expandedRows[order._id] && (
                          <tr className="animate-in fade-in slide-in-from-top-2 border-l-2 border-blue-600 bg-slate-50 duration-200 dark:bg-slate-900/90">
                            <td colSpan="8" className="px-12 py-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="mb-4 text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400">
                                    Product Details
                                  </h4>
                                  <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/80"
                                      >
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400">Rs. {item.price.toFixed(2)} each</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-bold text-blue-500 dark:text-blue-400">Qty: {item.quantity}</p>
                                          <p className="text-xs text-slate-900 dark:text-slate-200">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200/80 bg-blue-50/40 p-6 dark:border-slate-600 dark:bg-slate-800/70">
                                  <h4 className="mb-4 text-xs font-bold tracking-widest text-slate-600 dark:text-slate-300">
                                    Order Summary
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500 dark:text-slate-400">Payment Status</span>
                                      <span className="text-xs font-bold text-green-700 dark:text-emerald-300">{order.paymentStatus}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500 dark:text-slate-400">Delivery Identifier</span>
                                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{order._id.substring(4)}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between border-t border-slate-200 pt-4 dark:border-slate-600">
                                      <span className="font-bold text-slate-900 dark:text-slate-100">Total Amount</span>
                                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">Rs. {order.totalAmount.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-slate-600 text-lg tracking-widest font-bold">No orders found</p>
                          <button
                            onClick={() => { setSearchTerm(""); setStatusFilter("All"); setMethodFilter("All"); }}
                            className="mt-4 text-blue-600 hover:text-blue-500 font-bold transition flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredOrders.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/60 bg-transparent">
                  <div className="text-xs text-slate-600 font-medium tracking-tight">
                    Showing <span className="text-blue-600 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-blue-600 font-bold">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="text-blue-600 font-bold">{filteredOrders.length}</span> orders
                  </div>
                  {filteredOrders.length > itemsPerPage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 hover:bg-blue-50 hover:border-blue-600/50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all shadow-sm"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${currentPage === i + 1
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600/20'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-blue-600/50 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 hover:bg-blue-50 hover:border-blue-600/50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderManagement;




