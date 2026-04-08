import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

function DisplayAllInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const PAGE_BG = "#F2F2F2";
  const BORDER = "#E6E6E6";

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
    <div className="min-h-screen text-slate-900 flex flex-col" style={{ backgroundColor: PAGE_BG }}>
      <style>{modalAnimationStyles}</style>
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
        <header className="flex justify-between items-center px-8 py-5 bg-white border-b shadow-sm" style={{ borderColor: BORDER }}>
          <h1 className="text-2xl font-bold text-blue-700">
            📦 All Inventory
          </h1>

          <button
            onClick={handleNavigation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold border transition duration-300 transform hover:scale-105"
            style={{ borderColor: "#1D4ED8" }}
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
                    className="w-full px-4 py-2.5 rounded-lg bg-white text-slate-900 border-2 border-blue-200 focus:border-blue-500 focus:outline-none transition duration-300 placeholder-slate-400 text-sm font-medium"
                  />

                  {/* Clear button */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition text-xs"
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
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg text-white scale-105"
                        : "bg-white border border-gray-300 hover:border-blue-300 text-slate-700"
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
              <div className="text-sm text-slate-500 font-medium">
                📊 Found <span className="text-blue-500 font-bold">{filteredItems.length}</span> item{filteredItems.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* ================= ITEMS GRID ================= */}
            {filteredItems.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-slate-700 text-lg font-semibold mb-2">No items found</p>
                  <p className="text-slate-600 text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="group relative bg-white p-6 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl hover:border-blue-300 transition duration-500 transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* ANIMATED BACKGROUND GLOW */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/10 group-hover:to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur-xl -z-10"></div>

                    {/* IMAGE SECTION */}
                    {item.image && (
                      <div className="relative mb-6 overflow-hidden rounded-2xl h-60 w-full bg-gray-800">
                        <img
                          src={`http://localhost:5000/uploads/${item.image}`}
                          alt={item.itemName}
                          className="w-full h-full object-cover group-hover:scale-125 transition duration-500"
                        />
                        {/* GRADIENT OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/60 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                        {/* CONDITION BADGE ON IMAGE */}
                        <div className={`absolute top-3 right-3 px-4 py-2 rounded-full bg-gradient-to-r ${getConditionColor(item.condition)} border backdrop-blur-md font-bold text-sm`}>
                          {getConditionIcon(item.condition)} {item.condition}
                        </div>
                      </div>
                    )}

                    {/* ITEM NAME - HIGHLIGHTED */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600-400 group-hover:to-blue-600-500 group-hover:bg-clip-text transition duration-300">
                      {item.itemName}
                    </h3>

                    {/* CATEGORY BADGE */}
                    <div className="flex gap-2 mb-4">
                      <span className="px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
                        {item.category === "Cardio" && "🏃"} {item.category === "Strength" && "💪"} {item.category === "Accessories" && "🎒"} {item.category}
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold">
                        📦 x{item.quantity}
                      </span>
                    </div>

                    {/* DIVIDER */}
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-600-400/30 to-transparent mb-4"></div>

                    {/* DETAILS SECTION */}
                    <div className="space-y-3">
                      {/* Stock Info */}
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-300 transition">
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Stock</p>
                        <p className="text-2xl font-bold text-blue-500 mt-1">{item.quantity}</p>
                      </div>

                      {/* Supplier */}
                      {item.supplier && (
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Supplier</p>
                          <p className="text-sm text-slate-800 mt-1 font-medium truncate">{item.supplier}</p>
                        </div>
                      )}

                      {/* Purchase Date */}
                      {item.purchaseDate && (
                        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Purchase Date</p>
                          <p className="text-sm text-indigo-700 mt-1 font-medium">
                            📅 {new Date(item.purchaseDate).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      )}

                      {/* Special Details */}
                      {item.specialDetails && (
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Special Details</p>
                          <p className="text-sm text-blue-700 mt-1 font-medium line-clamp-3">{item.specialDetails}</p>
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



