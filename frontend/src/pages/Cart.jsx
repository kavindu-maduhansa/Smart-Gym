import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setMessage("Error fetching cart");
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (supplementId, newQuantity) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/cart/update`,
        {
          supplementId,
          quantity: newQuantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart(response.data.cart);
      setMessage("Cart updated");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating cart:", error);
      setMessage(error.response?.data?.message || "Error updating cart");
    }
  };

  const handleRemoveItem = async (supplementId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/cart/remove/${supplementId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart(response.data.cart);
      setMessage("Item removed from cart");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error removing item:", error);
      setMessage("Error removing item");
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear the entire cart?")) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data.cart);
        setMessage("Cart cleared");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        console.error("Error clearing cart:", error);
        setMessage("Error clearing cart");
      }
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="page-bg-base flex items-center justify-center">
        <p className="text-slate-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="page-bg-base overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 ambient-gradient"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="backdrop-blur-md bg-gradient-to-br from-blue-600-500/20 to-blue-600-500/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mr-3 sm:mr-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Shopping Cart</h1>
              </div>
              <button
                onClick={() => navigate("/supplement-store")}
                className="bg-slate-200 hover:bg-white/30 text-slate-900 px-6 py-2 rounded-lg font-semibold transition"
              >
                Continue Shopping
              </button>
            </div>
            <p className="text-slate-700 text-base sm:text-lg">
              Review your selected supplements and proceed to checkout
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg text-blue-800">
              {message}
            </div>
          )}

          {/* Cart Items */}
          {!cart || cart.items.length === 0 ? (
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-12 text-center">
              <svg
                className="w-16 h-16 text-slate-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-slate-700 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => navigate("/supplement-store")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items List */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-white/10 to-white/5 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Items ({cart.items.length})</h2>
                  </div>

                  <div className="divide-y divide-white/10">
                    {cart.items.map((item) => (
                      <div
                        key={item.supplementId._id}
                        className="p-6 flex items-center gap-4 hover:bg-slate-50 transition"
                      >
                        {item.supplementId.image && (
                          <img
                            src={item.supplementId.image}
                            alt={item.supplementId.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {item.supplementId.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Rs. {item.price.toFixed(2)} each
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.supplementId._id,
                                item.quantity - 1
                              )
                            }
                            className="bg-slate-200 hover:bg-white/30 text-slate-900 w-8 h-8 rounded transition"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-slate-900 font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.supplementId._id,
                                item.quantity + 1
                              )
                            }
                            className="bg-slate-200 hover:bg-white/30 text-slate-900 w-8 h-8 rounded transition"
                          >
                            +
                          </button>
                        </div>

                        <div className="min-w-max">
                          <p className="text-lg font-bold text-blue-500 mb-2">
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.supplementId._id)}
                            className="bg-red-600/50 hover:bg-red-600 text-slate-900 px-3 py-1 rounded text-sm transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-gradient-to-r from-white/10 to-white/5 border-t border-slate-200">
                    <button
                      onClick={handleClearCart}
                      className="bg-red-600/50 hover:bg-red-600 text-slate-900 px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="backdrop-blur-md bg-gradient-to-br from-blue-600-500/20 to-blue-600-500/10 border border-blue-600/30 rounded-xl p-6 sticky top-32">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal:</span>
                      <span>Rs. {cart.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 items-center">
                      <span>Shipping:</span>
                      <span className="text-xs text-slate-500">Calculated at checkout</span>
                    </div>

                    <div className="border-t border-slate-300 pt-4 flex justify-between text-lg font-bold text-blue-500">
                      <span>Total:</span>
                      <span>Rs. {(cart.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;




