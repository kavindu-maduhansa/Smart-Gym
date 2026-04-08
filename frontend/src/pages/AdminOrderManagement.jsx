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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
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
              <button onClick={() => navigate("/admin-dashboard")} className="bg-slate-200 hover:bg-white/30 text-slate-900 px-6 py-2 rounded-lg font-semibold transition border border-slate-200">
                Back to Dashboard
              </button>
            </div>
            <p className="text-slate-700 text-base sm:text-lg tracking-wide opacity-70">View Orders</p>
          </div>

          {/* Filters */}
          <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Search Orders</label>
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
                <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-blue-50/40 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                >
                  <option value="All">All Status</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Method</label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full bg-blue-50/40 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                >
                  <option value="All">All Methods</option>
                  <option value="Home Delivery">Home Delivery</option>
                  <option value="Pickup at Counter">Pickup at Counter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 uppercase text-xs tracking-widest font-bold border-b border-slate-200">
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
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr className="hover:bg-slate-50 transition group cursor-pointer" onClick={() => toggleRow(order._id)}>
                          <td className="px-4 py-3 font-mono text-sm text-slate-500 group-hover:text-slate-900">
                            <div className="flex items-center gap-2">
                              <svg className={`w-3 h-3 transition-transform ${expandedRows[order._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                              </svg>
                              {order._id}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{order.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-600">{order.user?.email || 'N/A'}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap inline-block shadow-sm border ${order.deliveryMethod === 'Pickup at Counter' ? 'bg-purple-100/80 text-purple-700 border-purple-200' : 'bg-blue-100/80 text-blue-700 border-blue-200'}`}>
                              {order.deliveryMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-black text-slate-900 whitespace-nowrap">
                            Rs. {order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm border ${order.status === 'Delivered' ? 'bg-green-100/80 text-green-700 border-green-200' :
                              order.status === 'Processing' ? 'bg-amber-100/80 text-amber-700 border-amber-200' :
                                'bg-blue-100/80 text-blue-700 border-blue-200'
                              }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              className="bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer whitespace-nowrap"
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
                          <tr className="bg-slate-50 border-l-2 border-blue-600 animate-in fade-in slide-in-from-top-2 duration-200">
                            <td colSpan="8" className="px-12 py-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Product Details</h4>
                                  <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-white/5">
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                          <p className="text-xs text-slate-500">Rs. {item.price.toFixed(2)} each</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm font-bold text-blue-500">Qty: {item.quantity}</p>
                                          <p className="text-xs text-slate-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-blue-50/40 p-6 rounded-2xl border border-white/5">
                                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Order Summary</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Payment Status</span>
                                      <span className="text-green-700 font-bold uppercase text-xs">{order.paymentStatus}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Delivery Identifier</span>
                                      <span className="text-slate-700 font-mono text-xs">{order._id.substring(4)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                                      <span className="text-slate-900 font-bold">Total Amount</span>
                                      <span className="text-blue-600 text-xl font-black">Rs. {order.totalAmount.toFixed(2)}</span>
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
                          <p className="text-slate-600 text-lg uppercase tracking-widest font-bold">No orders found</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderManagement;




