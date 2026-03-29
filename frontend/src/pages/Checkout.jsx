import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Home Delivery");
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});

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
      if (response.data.items.length === 0) {
        navigate("/cart");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setMessage("Error fetching cart");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-formatting for Card Number
    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").substring(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    
    // Auto-formatting for Expiry
    if (name === "expiry") {
      value = value.replace(/\D/g, "").substring(0, 4);
      if (value.length > 2) {
        value = value.substring(0, 2) + "/" + value.substring(2);
      }
    }
    
    // CVV limit
    if (name === "cvv") {
      value = value.replace(/\D/g, "").substring(0, 4);
    }

    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    
    if (deliveryMethod === "Home Delivery") {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
      if (!/^\d{5,10}$/.test(formData.postalCode.replace(/\s/g, ""))) {
        newErrors.postalCode = "Invalid postal code format";
      }
    }

    if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    
    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = "Use MM/YY format";
    } else {
      const [m, y] = formData.expiry.split("/").map(n => parseInt(n));
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      if (m < 1 || m > 12) {
        newErrors.expiry = "Invalid month (01-12)";
      } else if (y < currentYear || (y === currentYear && m < currentMonth)) {
        newErrors.expiry = "Card has expired";
      }
    }
    
    if (formData.cvv.length < 3) {
      newErrors.cvv = "Invalid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("Please correct the errors in the form.");
      return;
    }
    setProcessing(true);

    // Mock success flow
    setTimeout(() => {
      const orderId = "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase();
      setGeneratedOrderId(orderId);
      setProcessing(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Loading checkout...</p>
      </div>
    );
  }

  const tax = cart.totalPrice * 0.1;
  const total = cart.totalPrice + tax;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8 text-slate-900 border-l-4 border-blue-600 pl-4">
            Checkout
          </h1>

          {message && (
            <div className={`mb-8 p-4 rounded-lg border ${message.includes("successfully") ? "bg-green-500/20 border-green-500/50 text-green-200" : "bg-blue-600/20 border-blue-600/50 text-blue-200"}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Delivery Method */}
                <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">1</span>
                    Delivery Method
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("Home Delivery")}
                      className={`p-4 rounded-xl border transition flex flex-col items-center gap-2 ${
                        deliveryMethod === "Home Delivery"
                          ? "bg-blue-600/20 border-blue-600 text-blue-500"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="font-bold">Home Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("Pickup at Counter")}
                      className={`p-4 rounded-xl border transition flex flex-col items-center gap-2 ${
                        deliveryMethod === "Pickup at Counter"
                          ? "bg-blue-600/20 border-blue-600 text-blue-500"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-bold">Pickup at Counter</span>
                    </button>
                  </div>
                </div>

                {/* Shipping Details - Only show for Home Delivery or just show Full Name for Pickup */}
                <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">2</span>
                    {deliveryMethod === "Home Delivery" ? "Shipping Address" : "Receiver Details"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-500 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                        placeholder="John Doe"
                      />
                      {errors.fullName && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.fullName}</p>}
                    </div>
                    {deliveryMethod === "Home Delivery" && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-500 mb-2">Address</label>
                          <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                            placeholder="123 Gym St."
                          />
                          {errors.address && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.address}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                            placeholder="Colombo"
                          />
                          {errors.city && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-2">Postal Code</label>
                          <input
                            type="text"
                            name="postalCode"
                            required
                            value={formData.postalCode}
                            onChange={handleChange}
                            className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                            placeholder="10115"
                          />
                          {errors.postalCode && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.postalCode}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-500 mb-2">Country</label>
                          <input
                            type="text"
                            name="country"
                            required
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                            placeholder="Sri Lanka"
                          />
                          {errors.country && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.country}</p>}
                        </div>
                      </>
                    )}
                    {deliveryMethod === "Pickup at Counter" && (
                      <div className="md:col-span-2 bg-blue-600/10 border border-blue-600/30 rounded-xl p-6 text-center">
                        <p className="text-blue-500 font-bold mb-2 uppercase tracking-wide">Ready for Pickup</p>
                        <p className="text-sm text-slate-500 italic">Please collect your items at the Smart Gym main counter after successful payment.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3">3</span>
                    Payment Method
                  </h2>
                  <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center text-blue-500 font-semibold mb-2">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM5 12a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Credit / Debit Card
                    </div>
                    <p className="text-xs text-blue-400 opacity-70">Secure encrypted payment processing</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-500 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition font-mono"
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                      />
                      {errors.cardNumber && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.cardNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        required
                        value={formData.expiry}
                        onChange={handleChange}
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {errors.expiry && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-2">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        required
                        value={formData.cvv}
                        onChange={handleChange}
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-600 transition"
                        placeholder="123"
                        maxLength="4"
                      />
                      {errors.cvv && <p className="mt-1 text-xs text-blue-600 font-bold">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition border border-slate-200"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-[2] bg-gradient-to-r from-blue-600-500 to-blue-600 hover:from-blue-600 hover:to-blue-600-700 text-slate-900 font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    {processing ? "Processing..." : `Pay $${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-gradient-to-br from-blue-600-500/20 to-blue-600-500/10 border border-blue-600/30 rounded-2xl p-6 sticky top-32 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.items.map((item) => (
                    <div key={item.supplementId._id} className="flex gap-4 items-center group">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {item.supplementId.image && (
                          <img src={item.supplementId.image} alt={item.supplementId.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-500 transition">{item.supplementId.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-semibold">${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Shipping</span>
                    <span className="text-green-400 font-semibold uppercase text-[10px] bg-green-400/10 px-2 py-0.5 rounded tracking-tighter">Free</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-sm">
                    <span>Estimated Tax (10%)</span>
                    <span className="text-slate-900 font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-4 mt-2 flex justify-between items-baseline">
                    <span className="text-slate-900 font-bold text-lg">Total</span>
                    <div className="text-right">
                      <span className="text-blue-600 text-2xl font-black">${total.toFixed(2)}</span>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest leading-none">All taxes included</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-blue-50/80 backdrop-blur-xl animate-in fade-in duration-300"></div>
          <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900 to-blue-50 border border-blue-600/30 rounded-3xl p-8 shadow-2xl shadow-blue-600/20 transform animate-in zoom-in-95 fade-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30 animate-pulse">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Order Confirmed!</h2>
              <p className="text-slate-500 mb-6">Thank you for your purchase. Your premium supplements are being prepared.</p>
              
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8">
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Order Identifier</p>
                <p className="text-xl font-mono font-bold text-blue-600">{generatedOrderId}</p>
              </div>

              <button
                onClick={() => navigate("/supplement-store")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-600/20 uppercase tracking-widest"
              >
                Confirm & Return to Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;





