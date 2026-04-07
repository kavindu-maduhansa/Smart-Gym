import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import gymBg from "../assets/gym-bg.jpg";

const modalAnimationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .modal-fade-in { animation: fadeIn 0.3s ease-out; }
  .modal-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
`;

function ManageInventory() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isFormAnimating, setIsFormAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Edit form state
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Cardio",
    quantity: 0,
    condition: "Good",
    supplier: "",
    specialDetails: "",
    purchaseDate: "",
    image: null,
    previewUrl: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/inventory");
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch inventory items");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/admin/inventory-dashboard");
    }, 400);
  };

  const handleEdit = (item) => {
    setIsFormAnimating(true);
    setEditingId(item._id);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      condition: item.condition,
      supplier: item.supplier,
      specialDetails: item.specialDetails || "",
      purchaseDate: item.purchaseDate
        ? new Date(item.purchaseDate).toISOString().split("T")[0]
        : "",
      image: null,
      previewUrl: item.image ? `http://localhost:5000/uploads/${item.image}` : "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        previewUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for specific fields
    if (name === "itemName") {
      // Only allow letters and spaces
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData({ ...formData, [name]: lettersOnly });
    } else if (name === "supplier") {
      // Only allow letters and spaces
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData({ ...formData, [name]: lettersOnly });
    } else if (name === "quantity") {
      // Only allow positive numbers
      if (value === "" || parseInt(value) > 0) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = new FormData();
      updateData.append("itemName", formData.itemName);
      updateData.append("category", formData.category);
      updateData.append("quantity", formData.quantity);
      updateData.append("condition", formData.condition);
      updateData.append("supplier", formData.supplier);
      updateData.append("specialDetails", formData.specialDetails);
      updateData.append("purchaseDate", formData.purchaseDate);
      if (formData.image) updateData.append("image", formData.image);

      await axios.put(
        `http://localhost:5000/api/inventory/${editingId}`,
        updateData
      );

      alert("✅ Item updated successfully!");
      setEditingId(null);
      setFormData({
        itemName: "",
        category: "Cardio",
        quantity: 0,
        condition: "Good",
        supplier: "",
        specialDetails: "",
        purchaseDate: "",
        image: null,
        previewUrl: "",
      });
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to update item");
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${itemId}`);
        alert("✅ Item deleted successfully!");
        fetchItems();
      } catch (err) {
        console.error(err);
        alert("Failed to delete item");
      }
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConditionColor = (condition) => {
    switch (condition) {
      case "New":
        return "from-green-500/20 to-green-600/20 border-green-400/30";
      case "Good":
        return "from-blue-500/20 to-blue-600/20 border-blue-400/30";
      case "Maintenance":
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-400/30";
      case "Damaged":
        return "from-red-500/20 to-red-600/20 border-red-400/30";
      default:
        return "from-gray-500/20 to-gray-600/20 border-gray-400/30";
    }
  };

  const getConditionIcon = (condition) => {
    switch (condition) {
      case "New":
        return "🆕";
      case "Good":
        return "✅";
      case "Maintenance":
        return "🔧";
      case "Damaged":
        return "⚠️";
      default:
        return "📦";
    }
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.65) 0%, rgba(20, 24, 36, 0.7) 100%), url('${gymBg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <style>{`
        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
        .transitioning-out {
          animation: slideOutLeft 0.4s ease-in-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes formPopIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px) rotateX(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0deg);
          }
        }
        @keyframes formPopOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0deg);
          }
          to {
            opacity: 0;
            transform: scale(0.8) translateY(-20px) rotateX(-10deg);
          }
        }
        @keyframes modalBackdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(-50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes modalScaleOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.85) translateY(-50px);
          }
        }
        .modal-backdrop-enter {
          animation: modalBackdropFadeIn 0.3s ease-out forwards;
        }
        .modal-content-enter {
          animation: modalScaleIn 0.35s ease-out forwards;
        }
        .modal-content-exit {
          animation: modalScaleOut 0.3s ease-in forwards;
        }
        .form-enter {
          animation: formPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .form-exit {
          animation: formPopOut 0.3s ease-in forwards;
        }
        .item-card {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .modal-fade-in { animation: fadeIn 0.3s ease-out; }
        .modal-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      <div className={`relative z-10 flex flex-col min-h-screen ${isTransitioning ? "transitioning-out" : ""}`}>
        {/* ================= HEADER ================= */}
        <header className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-[#141824]/95 via-[#141824]/90 to-[#1a1f2e]/90 backdrop-blur-xl border-b border-orange-500/30 shadow-xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            ⚙️ Manage Inventory
          </h1>

          <button
            onClick={handleNavigation}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-orange-500/30 hover:to-orange-600/30 px-6 py-2 rounded-lg font-semibold border border-orange-400/20 transition duration-300 transform hover:scale-105"
          >
            ← Back
          </button>
        </header>

        {/* ================= MAIN ================= */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8 w-full max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔎 Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-orange-500/20 text-white border-2 border-orange-400/50 focus:border-orange-500 focus:outline-none transition duration-300 backdrop-blur-md placeholder-orange-200/60 text-sm font-medium hover:bg-orange-500/25 hover:border-orange-400/70"
                />
                
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-300 hover:text-orange-500 transition text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-400 text-lg">⏳ Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-400 text-lg">📭 No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ================= ITEMS LIST ================= */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-bold text-orange-400 mb-4">
                    Items ({filteredItems.length})
                  </h2>
                  <div className="space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto pr-3">
                    {filteredItems.map((item, idx) => (
                      <div
                        key={item._id}
                        className={`item-card p-8 rounded-2xl backdrop-blur-md cursor-pointer transition duration-300 transform ${
                          editingId === item._id
                            ? "bg-gradient-to-br from-blue-500/15 to-blue-600/15 border-2 border-blue-400 shadow-lg shadow-blue-500/20"
                            : "bg-gradient-to-br from-[#1a1f2e]/85 to-[#0f1117]/85 border-2 border-gray-600/50 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-400/10"
                        }`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                        onClick={() => handleEdit(item)}
                      >
                        <div className="flex gap-6">
                          {/* Image */}
                          {item.image && (
                            <img
                              src={`http://localhost:5000/uploads/${item.image}`}
                              alt={item.itemName}
                              className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
                            />
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-2xl truncate">{item.itemName}</h3>
                            <div className="flex gap-3 mt-3">
                              <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-sm font-bold">
                                {item.category}
                              </span>
                              <span className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${getConditionColor(item.condition)} border text-sm font-bold`}>
                                {getConditionIcon(item.condition)}
                              </span>
                            </div>
                            <div className="text-base text-gray-300 mt-3 space-y-1.5">
                              <p>📦 {item.quantity} units</p>
                            </div>
                          </div>

                          {/* Action Icons */}
                          <div className="flex flex-col gap-3 justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition text-lg"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item._id);
                              }}
                              className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition text-lg"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= EDIT FORM ================= */}
                <div className="lg:col-span-2">
                  {editingId ? (
                    <div className={`bg-gradient-to-br from-[#1a1f2e]/85 to-[#0f1117]/85 backdrop-blur-md p-6 rounded-2xl border-2 border-orange-500/50 shadow-xl sticky top-8 ${isFormAnimating ? 'form-enter' : 'form-exit'}`}
                      onAnimationEnd={() => {
                        if (!editingId) {
                          setIsFormAnimating(false);
                        }
                      }}
                    >
                      <h2 className="text-xl font-bold text-orange-400 mb-4">✏️ Edit Item</h2>

                      <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                        {/* Item Name */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Item Name</label>
                          <input
                            type="text"
                            name="itemName"
                            value={formData.itemName}
                            onChange={handleFormChange}
                            className="w-full p-2.5 rounded-lg bg-gray-700/50 text-white border border-orange-400/30 focus:border-orange-500 focus:outline-none transition"
                          />
                        </div>

                        {/* Category & Quantity */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Category</label>
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleFormChange}
                              className="w-full p-2.5 rounded-lg bg-gray-700/50 text-white border border-orange-400/30 focus:border-orange-500 focus:outline-none transition text-sm"
                            >
                              <option value="Cardio">🏃 Cardio</option>
                              <option value="Strength">💪 Strength</option>
                              <option value="Accessories">🎒 Accessories</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Quantity</label>
                            <input
                              type="number"
                              name="quantity"
                              value={formData.quantity}
                              onChange={handleFormChange}
                              min="0"
                              className="w-full p-2.5 rounded-lg bg-gray-700/50 text-white border border-orange-400/30 focus:border-orange-500 focus:outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Condition */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Condition</label>
                          <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleFormChange}
                            className="w-full p-2.5 rounded-lg bg-gray-700/50 text-white border border-orange-400/30 focus:border-orange-500 focus:outline-none transition text-sm"
                          >
                            <option value="New">🆕 New</option>
                            <option value="Good">✅ Good</option>
                            <option value="Maintenance">🔧 Maintenance</option>
                            <option value="Damaged">⚠️ Damaged</option>
                          </select>
                        </div>

                        {/* Supplier */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Supplier</label>
                          <input
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleFormChange}
                            className="w-full p-2.5 rounded-lg bg-gray-700/50 text-white border border-orange-400/30 focus:border-orange-500 focus:outline-none transition"
                          />
                        </div>

                        {/* Special Details */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Special Details</label>
                          <textarea
                            name="specialDetails"
                            value={formData.specialDetails}
                            onChange={handleFormChange}
                            rows="3"
                            className="w-full p-2.5 rounded-lg bg-gray-700/50 text-white border border-orange-400/30 focus:border-orange-500 focus:outline-none transition text-sm resize-none"
                            placeholder="Enter special details or maintenance notes..."
                          />
                        </div>

                        {/* Purchase Date */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Purchase Date</label>
                          <input
                            type="date"
                            name="purchaseDate"
                            value={formData.purchaseDate}
                            onChange={handleFormChange}
                            className="w-full p-2.5 rounded-lg bg-gray-700/50 text-white border border-orange-400/30 focus:border-orange-500 focus:outline-none transition text-sm"
                          />
                        </div>

                        {/* Image */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Item Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-2.5 rounded-lg bg-gray-700/50 text-gray-300 border border-orange-400/30 focus:border-orange-500 focus:outline-none transition text-sm cursor-pointer"
                          />
                          {formData.previewUrl && (
                            <img
                              src={formData.previewUrl}
                              alt="Preview"
                              className="mt-3 w-full h-32 object-cover rounded-lg border border-orange-400/30"
                            />
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6 border-t border-orange-400/20 pt-4">
                        <button
                          onClick={handleUpdate}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 px-4 py-2.5 rounded-lg font-bold text-white transition transform hover:scale-105 shadow-lg text-sm"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => {
                            setIsFormAnimating(false);
                            setTimeout(() => {
                              setEditingId(null);
                              setFormData({
                                itemName: "",
                                category: "Cardio",
                                quantity: 0,
                                condition: "Good",
                                supplier: "",
                                specialDetails: "",
                                purchaseDate: "",
                                image: null,
                                previewUrl: "",
                              });
                            }, 300);
                          }}
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-4 py-2.5 rounded-lg font-bold text-white transition transform hover:scale-105 shadow-lg text-sm"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-[#1a1f2e]/85 to-[#0f1117]/85 backdrop-blur-md p-6 rounded-2xl border-2 border-gray-500/20 shadow-xl text-center sticky top-8">
                      <p className="text-gray-400 text-sm">👈 Click on an item to edit it</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ManageInventory;
