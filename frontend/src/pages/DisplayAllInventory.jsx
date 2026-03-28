import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import gymBg from "../assets/gym-bg.jpg";

function DisplayAllInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory");
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch inventory");
    }
  };

  const handleNavigation = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/admin/inventory-dashboard");
    }, 400);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(items.map((item) => item.category))];

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
        .grid > div {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .grid > div:nth-child(2) {
          animation-delay: 0.1s;
        }
        .grid > div:nth-child(3) {
          animation-delay: 0.2s;
        }
        .grid > div:nth-child(4) {
          animation-delay: 0.3s;
        }
        .grid > div:nth-child(5) {
          animation-delay: 0.4s;
        }
        .grid > div:nth-child(n+6) {
          animation-delay: 0.5s;
        }
      `}</style>

      <div className={`relative z-10 flex flex-col min-h-screen ${isTransitioning ? "transitioning-out" : ""}`}>
        {/* ================= HEADER ================= */}
        <header className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-[#141824]/95 via-[#141824]/90 to-[#1a1f2e]/90 backdrop-blur-xl border-b border-orange-500/30 shadow-xl">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            📦 All Inventory
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
            {/* ================= SEARCH & FILTER ================= */}
            <div className="mb-10 space-y-4">
              {/* Search Bar - Compact Transparent Orange */}
              <div className="relative group w-full max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔎 Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-orange-500/20 text-white border-2 border-orange-400/50 focus:border-orange-500 focus:outline-none transition duration-300 backdrop-blur-md placeholder-orange-200/60 text-sm font-medium hover:bg-orange-500/25 hover:border-orange-400/70"
                  />
                  
                  {/* Clear button */}
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

              {/* Category Filter */}
              <div className="flex gap-3 flex-wrap pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full font-semibold text-sm transition duration-300 transform hover:scale-105 ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50 text-white scale-105"
                        : "bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-500/40 hover:border-orange-400/60 text-gray-300 hover:text-white"
                    }`}
                  >
                    {cat === "Cardio" && "🏃 "}
                    {cat === "Strength" && "💪 "}
                    {cat === "Accessories" && "🎒 "}
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-400 font-medium">
                📊 Found <span className="text-orange-400 font-bold">{filteredItems.length}</span> item{filteredItems.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* ================= ITEMS GRID ================= */}
            {filteredItems.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-300 text-lg font-semibold mb-2">No items found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="group relative bg-gradient-to-br from-[#1a1f2e]/90 via-[#141824]/85 to-[#0f1117]/95 backdrop-blur-xl p-6 rounded-3xl border border-orange-400/25 shadow-2xl hover:shadow-3xl hover:shadow-orange-500/40 hover:border-orange-400/60 transition duration-500 transform hover:-translate-y-3 overflow-hidden"
                  >
                    {/* ANIMATED BACKGROUND GLOW */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600/0 via-orange-500/0 to-orange-600/0 group-hover:from-orange-600/20 group-hover:via-orange-500/20 group-hover:to-orange-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur-xl -z-10"></div>

                    {/* IMAGE SECTION */}
                    {item.image && (
                      <div className="relative mb-6 overflow-hidden rounded-2xl h-60 w-full bg-gray-800">
                        <img
                          src={`http://localhost:5000/uploads/${item.image}`}
                          alt={item.itemName}
                          className="w-full h-full object-cover group-hover:scale-125 transition duration-500"
                        />
                        {/* GRADIENT OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        
                        {/* CONDITION BADGE ON IMAGE */}
                        <div className={`absolute top-3 right-3 px-4 py-2 rounded-full bg-gradient-to-r ${getConditionColor(item.condition)} border backdrop-blur-md font-bold text-sm`}>
                          {getConditionIcon(item.condition)} {item.condition}
                        </div>
                      </div>
                    )}

                    {/* ITEM NAME - HIGHLIGHTED */}
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-orange-500 group-hover:bg-clip-text transition duration-300">
                      {item.itemName}
                    </h3>

                    {/* CATEGORY BADGE */}
                    <div className="flex gap-2 mb-4">
                      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-wide">
                        {item.category === "Cardio" && "🏃"} {item.category === "Strength" && "💪"} {item.category === "Accessories" && "🎒"} {item.category}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
                        📦 x{item.quantity}
                      </span>
                    </div>

                    {/* DIVIDER */}
                    <div className="h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent mb-4"></div>

                    {/* DETAILS SECTION */}
                    <div className="space-y-3">
                      {/* Stock Info */}
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-400/20 hover:border-orange-400/40 transition">
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Stock</p>
                        <p className="text-2xl font-bold text-orange-400 mt-1">{item.quantity}</p>
                      </div>

                      {/* Supplier */}
                      {item.supplier && (
                        <div className="p-3 rounded-lg bg-gradient-to-r from-gray-700/30 to-gray-600/20 border border-gray-500/20">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Supplier</p>
                          <p className="text-sm text-gray-200 mt-1 font-medium truncate">{item.supplier}</p>
                        </div>
                      )}

                      {/* Purchase Date */}
                      {item.purchaseDate && (
                        <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Purchase Date</p>
                          <p className="text-sm text-indigo-300 mt-1 font-medium">
                            📅 {new Date(item.purchaseDate).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      )}

                      {/* Special Details */}
                      {item.specialDetails && (
                        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Special Details</p>
                          <p className="text-sm text-blue-300 mt-1 font-medium line-clamp-3">{item.specialDetails}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DisplayAllInventory;