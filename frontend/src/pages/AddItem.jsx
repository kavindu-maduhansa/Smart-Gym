import { useState } from "react";
import axios from "axios";

function AddItem() {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Cardio");
  const [quantity, setQuantity] = useState(0);
  const [condition, setCondition] = useState("Good");
  const [supplier, setSupplier] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("itemName", itemName);
      formData.append("category", category);
      formData.append("quantity", Number(quantity)); // convert to number
      formData.append("condition", condition);
      formData.append("supplier", supplier);
      formData.append("purchase.price", price);
      formData.append("purchase.purchaseDate", purchaseDate);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:5000/api/inventory/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Item added successfully!");

      // Reset form and revoke preview URL
      setItemName("");
      setCategory("Cardio");
      setQuantity(0);
      setCondition("Good");
      setSupplier("");
      setPrice("");
      setPurchaseDate("");
      if (preview) URL.revokeObjectURL(preview);
      setImage(null);
      setPreview(null);

    } catch (err) {
      console.log(err);
      alert("Failed to add item");
    }
  };

  return (
    <div className="min-h-screen bg-[#121418] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 relative">
        <div className="absolute inset-0 rounded-2xl opacity-20 bg-gradient-to-r from-orange-500/20 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-orange-500 mb-6">
            Add New Inventory Item
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="col-span-2 p-3 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            >
              <option value="Cardio">Cardio</option>
              <option value="Strength">Strength</option>
              <option value="Accessories">Accessories</option>
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              required
              className="p-3 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            />

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="p-3 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            >
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Damaged">Damaged</option>
            </select>

            <input
              type="text"
              placeholder="Supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="p-3 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="p-3 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            />

            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="p-3 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
            />

            {/* Image Upload */}
            <div className="col-span-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="p-2 rounded-lg bg-[#2a2e37] text-white border border-gray-600 focus:outline-none focus:border-orange-500"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-600"
                />
              )}
            </div>

            <button
              type="submit"
              className="col-span-2 mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(255,115,0,0.3)]"
            >
              Add Item
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddItem;