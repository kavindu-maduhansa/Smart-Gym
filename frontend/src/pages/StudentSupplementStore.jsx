import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const StudentSupplementStore = () => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("All");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const categories = ["All", "Protein", "Creatine", "BCAA", "Pre-Workout", "Vitamins", "Other"];

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supplements`);
      setSupplements(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching supplements:", error);
      setMessage("Error fetching supplements");
      setLoading(false);
    }
  };

  const handleAddToCart = async (supplement) => {
    if (!token) {
      setMessage("Please login to add items to cart");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/cart/add`,
        {
          supplementId: supplement._id,
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(`${supplement.name} added to cart!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage(error.response?.data?.message || "Error adding to cart");
    }
  };

  const filteredSupplements =
    filteredCategory === "All"
      ? supplements
      : supplements.filter((s) => s.category === filteredCategory);

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

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Supplement Store</h1>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                🛒 View Cart
              </button>
            </div>
            <p className="text-gray-300 text-base sm:text-lg">
              Browse and purchase premium gym supplements
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-200">
              {message}
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilteredCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filteredCategory === category
                    ? "bg-orange-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading supplements...</p>
            </div>
          ) : filteredSupplements.length === 0 ? (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-12 text-center">
              <p className="text-gray-400">No supplements found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSupplements.map((supplement) => (
                <div
                  key={supplement._id}
                  className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-orange-500/50 transition transform hover:scale-105"
                >
                  {supplement.image && (
                    <img
                      src={supplement.image}
                      alt={supplement.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{supplement.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{supplement.description}</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="text-gray-400">Brand:</span>{" "}
                        <span className="text-white">{supplement.brand}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Category:</span>{" "}
                        <span className="text-orange-400">{supplement.category}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-400">Serving:</span>{" "}
                        <span className="text-white">{supplement.servingSize}</span>
                      </p>
                      <p className="text-lg font-bold text-orange-400">
                        ${supplement.price}
                      </p>
                      <p className="text-sm">
                        <span
                          className={
                            supplement.quantity > 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          {supplement.quantity > 0
                            ? `In Stock (${supplement.quantity})`
                            : "Out of Stock"}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(supplement)}
                      disabled={supplement.quantity === 0}
                      className={`w-full py-2 rounded-lg font-semibold transition ${
                        supplement.quantity === 0
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {supplement.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
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

export default StudentSupplementStore;
