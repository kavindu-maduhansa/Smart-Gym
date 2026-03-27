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
      formData.append("quantity", quantity);
      formData.append("condition", condition);
      formData.append("supplier", supplier);
      formData.append("price", price);
      formData.append("purchaseDate", purchaseDate);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:5000/api/inventory/add", formData);
      alert("Item added successfully!");
      setItemName(""); setCategory("Cardio"); setQuantity(0);
      setCondition("Good"); setSupplier(""); setPrice(""); setPurchaseDate("");
      setImage(null); if (preview) URL.revokeObjectURL(preview); setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to add item");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
      <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-xl shadow-xl">
        <h2 className="text-2xl text-orange-500 font-bold mb-6">Add New Inventory Item</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} required className="p-3 rounded bg-gray-700 text-white" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="p-3 rounded bg-gray-700 text-white">
            <option value="Cardio">Cardio</option>
            <option value="Strength">Strength</option>
            <option value="Accessories">Accessories</option>
          </select>
          <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} min="0" className="p-3 rounded bg-gray-700 text-white" />
          <select value={condition} onChange={e => setCondition(e.target.value)} className="p-3 rounded bg-gray-700 text-white">
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Damaged">Damaged</option>
          </select>
          <input type="text" placeholder="Supplier" value={supplier} onChange={e => setSupplier(e.target.value)} className="p-3 rounded bg-gray-700 text-white" />
          <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="p-3 rounded bg-gray-700 text-white" />
          <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="p-3 rounded bg-gray-700 text-white" />
          <div className="col-span-2">
            <input type="file" accept="image/*" onChange={handleImageChange} className="p-2 rounded bg-gray-700 text-white w-full" />
            {preview && <img src={preview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />}
          </div>
          <button type="submit" className="col-span-2 bg-orange-500 text-white py-3 rounded font-bold hover:bg-orange-600 transition">Add Item</button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;