import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = () => {
    // Mock order data
    const mockOrders = [
      {
        _id: "ORD65F123456",
        createdAt: new Date().toISOString(),
        totalAmount: 48.40,
        subtotal: 44.00,
        tax: 4.40,
        deliveryMethod: "Home Delivery",
        status: "Processing",
        items: [
          { name: "Mega Grow Mass Gainer (5kg)", quantity: 1, price: 44.00 }
        ]
      },
      {
        _id: "ORD65F987654",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        totalAmount: 22.00,
        subtotal: 20.00,
        tax: 2.00,
        deliveryMethod: "Pickup at Counter",
        status: "Ready for Pickup",
        items: [
          { name: "BCAA Performance (30 Servings)", quantity: 2, price: 10.00 }
        ]
      }
    ];
    setOrders(mockOrders);
    setLoading(false);
  };

  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrder = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,127,17,0.1) 1px, transparent 1px), linear-gradient(rgba(255,127,17,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mr-3 sm:mr-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">My Orders</h1>
              </div>
              <button
                onClick={() => navigate("/supplement-store")}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition border border-white/10"
              >
                Return to Store
              </button>
            </div>
            <p className="text-gray-300 text-base sm:text-lg">
              Track your supplement orders and delivery status
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-200">
              {message}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-400 text-lg mb-6">You haven't placed any orders yet.</p>
              <button
                onClick={() => navigate("/supplement-store")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-orange-500/20"
              >
                Go to Store
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden hover:border-orange-500/50 transition transform hover:scale-[1.01] shadow-2xl cursor-pointer"
                  onClick={() => toggleOrder(order._id)}
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-transparent flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                        <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-sm font-bold text-orange-400">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Delivery Method</p>
                        <p className="text-sm font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${order.deliveryMethod === 'Pickup at Counter' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {order.deliveryMethod}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order Identifier</p>
                        <p className="text-sm font-mono text-gray-300">{order._id}</p>
                      </div>
                      <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedOrders[order._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Order Items & Calculations */}
                  <div className={`p-6 bg-black/20 ${expandedOrders[order._id] ? 'block' : 'hidden'}`}>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Ordered Items</p>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{item.name}</p>
                                <p className="text-xs text-gray-500">${item.price.toFixed(2)} x {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-white/10 pt-4 space-y-2 max-w-xs ml-auto">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Subtotal</span>
                          <span className="text-white">${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Tax (10%)</span>
                          <span className="text-white">${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2 mt-2">
                          <span className="text-orange-500">Total Charged</span>
                          <span className="text-orange-500">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Minimal Order Footer (Always visible) */}
                  {!expandedOrders[order._id] && (
                     <div className="px-6 py-2 bg-white/5 text-[10px] text-gray-500 flex gap-4">
                        <span>Items: {order.items.length}</span>
                        <span>Status: <span className="text-orange-400 uppercase font-bold">{order.status}</span></span>
                     </div>
                  )}

                  {/* Order Footer */}
                  <div className="p-4 bg-orange-500/5 border-t border-white/5 flex justify-between items-center px-6">
                    <span className="text-xs text-gray-500">
                      Payment Status: <span className="text-green-400 font-bold uppercase tracking-tighter">Paid</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Shipping Status: <span className="text-orange-400 font-bold uppercase tracking-tighter">{order.deliveryMethod === 'Pickup at Counter' ? 'Ready for Pickup' : 'Processing'}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
