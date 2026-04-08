import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const AdminSupplementStore = () => {
  const [supplements, setSupplements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Protein",
    price: "",
    quantity: "",
    brand: "",
    servingSize: "",
    image: "",
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supplements/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter to show only active supplements
      const activeSupplement = response.data.filter(s => s.isActive !== false);
      setSupplements(activeSupplement);
    } catch (error) {
      console.error("Error fetching supplements:", error);
      setMessage("Error fetching supplements");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSupplement = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update existing supplement
        await axios.put(`${API_BASE_URL}/supplements/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Supplement updated successfully!");
      } else {
        // Create new supplement
        await axios.post(`${API_BASE_URL}/supplements`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Supplement created successfully!");
      }

      // Reset form and fetch updated list
      setFormData({
        name: "",
        description: "",
        category: "Protein",
        price: "",
        quantity: "",
        brand: "",
        servingSize: "",
        image: "",
      });
      setEditingId(null);
      setShowModal(false);
      fetchSupplements();
    } catch (error) {
      console.error("Error saving supplement:", error);
      setMessage(error.response?.data?.message || "Error saving supplement");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSupplement = (supplement) => {
    setFormData(supplement);
    setEditingId(supplement._id);
    setShowModal(true);
  };

  const handleDeleteSupplement = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplement?")) {
      try {
        await axios.delete(`${API_BASE_URL}/supplements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("Supplement deleted successfully!");
        fetchSupplements();
      } catch (error) {
        console.error("Error deleting supplement:", error);
        setMessage("Error deleting supplement");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      category: "Protein",
      price: "",
      quantity: "",
      brand: "",
      servingSize: "",
      image: "",
    });
  };

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
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Supplement Management
                </h1>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Add Supplement
              </button>
            </div>
            <p className="text-slate-700 text-base sm:text-lg">
              Manage supplements and product listings
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg text-blue-800">
              {message}
            </div>
          )}

          {/* Supplements Grid */}
          {supplements.length === 0 ? (
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-12 text-center">
              <p className="text-slate-500">No supplements found. Add your first supplement!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplements.map((supplement) => (
                <div
                  key={supplement._id}
                  className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-slate-300 rounded-xl overflow-hidden hover:border-blue-600/50 transition"
                >
                  {supplement.image && (
                    <img
                      src={supplement.image}
                      alt={supplement.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{supplement.name}</h3>
                    <p className="text-slate-500 text-sm mb-3">{supplement.description}</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="text-slate-500">Brand:</span>{" "}
                        <span className="text-slate-900">{supplement.brand}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-500">Category:</span>{" "}
                        <span className="text-blue-500">{supplement.category}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-500">Price:</span>{" "}
                        <span className="text-slate-900 font-semibold">Rs. {supplement.price}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-500">Stock:</span>{" "}
                        <span className={supplement.quantity > 0 ? "text-green-700" : "text-red-700"}>
                          {supplement.quantity}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSupplement(supplement)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSupplement(supplement._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-slate-900 px-4 py-2 rounded transition text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-50/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-blue-600/30 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingId ? "Edit Supplement" : "Add New Supplement"}
            </h2>
            <form onSubmit={handleAddSupplement} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Protein">Protein</option>
                <option value="Creatine">Creatine</option>
                <option value="BCAA">BCAA</option>
                <option value="Pre-Workout">Pre-Workout</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Stock Quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                name="servingSize"
                placeholder="Serving Size (e.g., 25g, 100 servings)"
                value={formData.servingSize}
                onChange={handleInputChange}
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL (optional)"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 hover:bg-gray-600 text-slate-900 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupplementStore;




