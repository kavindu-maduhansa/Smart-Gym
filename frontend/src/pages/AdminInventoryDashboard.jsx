import React from "react";
import { useNavigate } from "react-router-dom";

const AdminInventoryDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      label: "ADD MACHINE",
      description: "Create new entry for machine and target components.",
      buttonText: "Add",
      route: "/admin/add-item",
      stats: "",
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
        </svg>
      ),
    },

    {
      label: "MANAGE MACHINES",
      description: "Active Machines",
      buttonText: "Manage",
      route: "/admin/manage-machines",
      stats: "35",
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 000-6l2.1-1.6-2-3.5-2.5 1a1.65 1.65 0 00-2.8-1.6L13 1h-4l-.9 2.3a1.65 1.65 0 00-2.8 1.6l-2.5-1-2 3.5L3.6 9a1.65 1.65 0 000 6L1.5 16.6l2 3.5 2.5-1a1.65 1.65 0 002.8 1.6L9 23h4l.9-2.3a1.65 1.65 0 002.8-1.6l2.5 1 2-3.5-2.1-1.6z" />
        </svg>
      ),
    },

    {
      label: "ALL INVENTORIES",
      description: "Items in Stock",
      buttonText: "View All",
      route: "/admin/all-inventory",
      stats: "150",
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10l9 4 9-4V7" />
        </svg>
      ),
    },

    {
      label: "GENERATE REPORT",
      description: "Last Report: Today",
      buttonText: "Generate",
      route: "/admin/reports",
      stats: "",
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6M9 18h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-[#121418] text-[#e0e0e0] font-sans relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,115,0,0.1),transparent_70%)]"></div>

      {/* Sidebar */}
      <aside className="w-72 bg-[#1c1f26] border-r border-gray-700 p-6 flex flex-col z-10">
        <h1 className="text-orange-500 text-lg font-bold mb-10 tracking-wider">
          MACHINE & INVENTORY <br /> MANAGEMENT SYSTEM
        </h1>

        <nav className="flex flex-col gap-3">
          <button className="flex items-center gap-3 p-3 bg-gray-700/50 text-orange-500 rounded-lg">
            📊 Dashboard
          </button>

          <button
            onClick={() => navigate("/admin/add-item")}
            className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-lg text-gray-400"
          >
            ➕ Add Machine
          </button>

          <button className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-lg text-gray-400">
            🛠️ Manage Machines
          </button>

          <button className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-lg text-gray-400">
            📋 View All Inventories
          </button>

          <button className="flex items-center gap-3 p-3 hover:bg-gray-700/30 rounded-lg text-gray-400">
            📄 Generate Reports
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto z-10">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search"
              className="p-2 pl-10 rounded-md bg-[#2a2e37] text-white w-full border border-gray-600 focus:outline-none focus:border-orange-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-xl text-orange-500 relative hover:scale-110 transition">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 text-[10px] flex items-center justify-center text-white font-bold">
                1
              </span>
            </button>

            <div className="flex items-center gap-3 border-l border-gray-600 pl-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Logged in:</p>
                <p className="text-sm font-bold text-orange-500">Admin</p>
              </div>
              <img
                src="https://via.placeholder.com/40"
                alt="Admin"
                className="rounded-full border-2 border-orange-500"
              />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-8 border-b border-gray-700 pb-4">
          Dashboard Overview
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, idx) => (
            <div
              key={idx}
              className="
                relative 
                bg-white/5 backdrop-blur-lg 
                border border-white/10 
                rounded-2xl p-6 
                shadow-lg
                transition-all duration-300
                hover:scale-105 hover:-translate-y-2
                hover:border-orange-500/50
                hover:shadow-[0_10px_30px_rgba(255,115,0,0.2)]
                group
              "
            >
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-orange-500/10 to-transparent"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  {card.icon}
                  {card.stats && (
                    <span className="text-3xl font-bold text-white group-hover:text-orange-400">
                      {card.stats}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-orange-500 text-sm uppercase mb-2">
                  {card.label}
                </h3>

                <p className="text-gray-400 text-xs mb-6 h-8">
                  {card.description}
                </p>

                <button
                  onClick={() => navigate(card.route)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  {card.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="mt-10 bg-[#1c1f26] border border-gray-700 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">
            Recent Inventories
          </h3>

          <div className="w-full h-32 flex items-center justify-center border border-dashed border-gray-600 rounded-xl text-gray-500">
            Inventory data table goes here...
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminInventoryDashboard;