import { useEffect, useState } from "react";
import axios from "axios";

function DisplayAllInventory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory");

      // ✅ IMPORTANT (your backend uses data)
      setItems(res.data.data);

    } catch (err) {
      console.error(err);
      alert("Failed to fetch inventory");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h2 className="text-2xl font-bold text-orange-500 mb-6">
        All Inventory Items
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-400">No items found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 p-4 rounded-xl shadow-lg"
            >
              {/* IMAGE */}
              {item.image && (
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.itemName}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}

              {/* DETAILS */}
              <h3 className="text-lg font-bold">{item.itemName}</h3>
              <p className="text-gray-400 text-sm">
                Category: {item.category}
              </p>
              <p>Quantity: {item.quantity}</p>
              <p>Condition: {item.condition}</p>

              <p className="text-orange-400 font-semibold">
                Rs. {item.purchase?.price || "N/A"}
              </p>

              <p className="text-xs text-gray-500">
                {item.purchase?.purchaseDate
                  ? new Date(item.purchase.purchaseDate).toLocaleDateString()
                  : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DisplayAllInventory;