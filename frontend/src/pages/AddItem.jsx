import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import gymBg from "../assets/gym-bg.jpg";

function AddItem() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Cardio");
  const [quantity, setQuantity] = useState(0);
  const [condition, setCondition] = useState("Good");
  const [supplier, setSupplier] = useState("");
  const [specialDetails, setSpecialDetails] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleItemNameChange = (e) => {
    const value = e.target.value;
    // Only allow letters and spaces
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
    setItemName(lettersOnly);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (value === "" || parseInt(value) > 0) {
      setQuantity(value);
    }
  };

  const handleSupplierChange = (e) => {
    const value = e.target.value;
    // Only allow letters and spaces
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
    setSupplier(lettersOnly);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate itemName
    if (!itemName.trim()) {
      newErrors.itemName = "Item name is required";
    } else if (itemName.trim().length < 2) {
      newErrors.itemName = "Item name must be at least 2 characters";
    } else if (itemName.trim().length > 100) {
      newErrors.itemName = "Item name must not exceed 100 characters";
    }

    // Validate quantity
    if (quantity === "" || quantity === null) {
      newErrors.quantity = "Quantity is required";
    } else if (parseInt(quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    } else if (parseInt(quantity) === 0) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    // Validate supplier
    if (supplier.trim() && supplier.trim().length > 100) {
      newErrors.supplier = "Supplier name must not exceed 100 characters";
    }

    // Validate purchase date
    if (purchaseDate) {
      const selectedDate = new Date(purchaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.purchaseDate = "Purchase date cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNavigation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/admin/inventory-dashboard");
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("itemName", itemName);
      formData.append("category", category);
      formData.append("quantity", quantity);
      formData.append("condition", condition);
      formData.append("supplier", supplier);
      formData.append("specialDetails", specialDetails);
      formData.append("purchaseDate", purchaseDate);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:5000/api/inventory/add", formData);
      setSuccessMessage("✅ Item Added Successfully!");
      setIsExiting(false);
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setSuccessMessage("");
          setIsExiting(false);
        }, 400);
      }, 2500);
      setItemName("");
      setCategory("Cardio");
      setQuantity(0);
      setCondition("Good");
      setSupplier("");
      setSpecialDetails("");
      setPurchaseDate("");
      setImage(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-900 flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.65) 0%, rgba(20, 24, 36, 0.7) 100%), url('${gymBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
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
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
        }
        .success-notification {
          animation: slideInDown 0.5s ease-out forwards;
        }
        .success-notification.exit {
          animation: slideOutUp 0.4s ease-in forwards;
        }
      `}</style>

      <div className={`relative z-10 flex flex-col min-h-screen ${isTransitioning ? 'transitioning-out' : ''}`}>
        {/* ================= HEADER ================= */}
        <header className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-[#DBEAFE]/95 via-[#DBEAFE]/90 to-[#BFDBFE]/90 backdrop-blur-xl border-b border-blue-600/30 shadow-xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600-400 to-blue-600-500 bg-clip-text text-transparent">
            ➕ Add New Machine
          </h1>

          <button
            onClick={handleNavigation}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-blue-600-500/30 hover:to-blue-600/30 px-6 py-2 rounded-lg font-semibold border border-blue-500/20 transition duration-300 transform hover:scale-105"
          >
            ← Back
          </button>
        </header>

        {/* ================= SUCCESS NOTIFICATION ================= */}
        {successMessage && (
          <div className={`success-notification fixed top-20 left-1/2 -translate-x-1/2 z-50 
          bg-gradient-to-r from-gray-900/90 to-gray-800/90 
          border border-green-400/40 
          px-8 py-5 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-3 backdrop-blur-xl
          ${isExiting ? 'exit' : ''} w-11/12 sm:w-96`}>

            {/* icon with soft glow */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
              <span className="text-green-400 text-2xl">✔</span>
            </div>

            {/* message */}
            <div className="flex flex-col text-center">
              <span className="text-slate-900 font-semibold text-sm tracking-wide">
                {successMessage}
              </span>
              <span className="text-green-300/80 text-xs">
                Successfully added to inventory
              </span>
            </div>

            {/* subtle progress bar */}
            <div className="absolute bottom-0 left-0 h-[3px] bg-green-400/70 w-full animate-pulse rounded-b-xl"></div>
          </div>
        )}

        {/* ================= MAIN ================= */}
        <main className="flex-1 p-8 flex items-center justify-center">
          {/* FORM CONTAINER */}
          <div className="w-full max-w-3xl">
            <div className="bg-gradient-to-br from-[#BFDBFE]/85 to-[#DBEAFE]/85 backdrop-blur-md p-8 rounded-2xl border border-blue-500/30 shadow-xl">
              <h2 className="text-3xl font-bold text-blue-500 mb-2">Add New Inventory Item</h2>
              <p className="text-slate-500 mb-8">Fill in all the details below</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ROW 1: Item Name & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Item Name *</label>
                    <input
                      type="text"
                      placeholder="Enter machine name"
                      value={itemName}
                      onChange={handleItemNameChange}
                      className={`w-full p-3 rounded-lg bg-slate-100 text-slate-900 border focus:outline-none transition ${errors.itemName ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                    />
                    {errors.itemName && <p className="text-red-400 text-sm mt-1">{errors.itemName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 focus:border-blue-600 focus:outline-none transition"
                    >
                      <option value="Cardio">🏃 Cardio</option>
                      <option value="Strength">💪 Strength</option>
                      <option value="Accessories">🎒 Accessories</option>
                    </select>
                  </div>
                </div>

                {/* ROW 2: Quantity & Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Quantity *</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      className={`w-full p-3 rounded-lg bg-slate-100 text-slate-900 border focus:outline-none transition ${errors.quantity ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                    />
                    {errors.quantity && <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 focus:border-blue-600 focus:outline-none transition"
                    >
                      <option value="New">🆕 New</option>
                      <option value="Good">✅ Good</option>
                      <option value="Maintenance">🔧 Maintenance</option>
                      <option value="Damaged">⚠️ Damaged</option>
                    </select>
                  </div>
                </div>

                {/* ROW 3: Supplier */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Supplier</label>
                  <input
                    type="text"
                    placeholder="Supplier name"
                    value={supplier}
                    onChange={handleSupplierChange}
                    className={`w-full p-3 rounded-lg bg-slate-100 text-slate-900 border focus:outline-none transition ${errors.supplier ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                  />
                  {errors.supplier && <p className="text-red-400 text-sm mt-1">{errors.supplier}</p>}
                </div>

                {/* ROW 4: Special Details */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Special Details</label>
                  <textarea
                    placeholder="Enter any special details or maintenance notes..."
                    value={specialDetails}
                    onChange={(e) => setSpecialDetails(e.target.value)}
                    rows="4"
                    className={`w-full p-3 rounded-lg bg-slate-100 text-slate-900 border focus:outline-none transition resize-none ${errors.specialDetails ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                  />
                  {errors.specialDetails && <p className="text-red-400 text-sm mt-1">{errors.specialDetails}</p>}
                </div>

                {/* ROW 5: Purchase Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className={`w-full p-3 rounded-lg bg-slate-100 text-slate-900 border focus:outline-none transition ${errors.purchaseDate ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                  />
                  {errors.purchaseDate && <p className="text-red-400 text-sm mt-1">{errors.purchaseDate}</p>}
                </div>

                {/* ROW 6: Image Upload */}
                <div className="bg-slate-100/50 border-2 border-dashed border-blue-500/30 rounded-lg p-6 text-center hover:border-blue-500/60 transition">
                  <label className="block text-sm font-semibold text-slate-800 mb-3">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="p-3 rounded-lg bg-slate-100 text-slate-700 w-full cursor-pointer"
                  />
                  {preview && (
                    <div className="mt-4">
                      <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-blue-500/30" />
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600-500 to-blue-600 hover:from-blue-600-400 hover:to-blue-600-500 text-slate-900 font-bold text-lg shadow-lg hover:shadow-blue-600/50 transition duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? "⏳ Adding..." : "✨ Add Item"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddItem;


