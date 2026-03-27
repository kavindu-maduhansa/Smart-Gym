import React from "react";
import { useNavigate } from "react-router-dom";

const AdminInventoryDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      label: "ADD MACHINE",
      description: "Create new entry for machine and target components.",
      buttonText: "Add",
      stats: "",
      onClick: () => navigate("/admin/add-item"),
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },

    {
      label: "MANAGE MACHINES",
      description: "Active Machines",
      buttonText: "Manage",
      stats: "35",
      onClick: () => alert("Manage section coming soon"),
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
    },

    {
      label: "ALL INVENTORIES",
      description: "Items in Stock",
      buttonText: "View All",
      stats: "150",
      onClick: () => navigate("/admin/inventory"), // ✅ FIXED ROUTE
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },

    {
      label: "GENERATE REPORT",
      description: "Last Report: Today",
      buttonText: "Generate",
      stats: "",
      onClick: () => alert("Report generation coming soon"),
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#121418] text-[#e0e0e0]">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#1c1f26] border-r border-gray-700 p-6">
        <h1 className="text-orange-500 font-bold mb-10 text-lg">
          MACHINE & INVENTORY SYSTEM
        </h1>

        <button
          onClick={() => navigate("/admin/add-item")}
          className="block w-full text-left p-3 hover:bg-gray-700 rounded mb-2"
        >
          ➕ Add Machine
        </button>

        <button
          onClick={() => navigate("/admin/inventory")}
          className="block w-full text-left p-3 hover:bg-gray-700 rounded"
        >
          📋 View Inventory
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl mb-6 font-semibold">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-xl shadow-lg">

              {/* ICON */}
              {card.icon}

              {/* TITLE */}
              <h3 className="text-orange-500 mt-4 font-bold">
                {card.label}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-gray-400 text-sm">
                {card.description}
              </p>

              {/* STATS */}
              {card.stats && (
                <p className="mt-2 text-lg font-semibold">
                  {card.stats}
                </p>
              )}

              {/* BUTTON */}
              <button
                onClick={card.onClick}
                className="mt-4 w-full bg-orange-500 hover:bg-orange-600 transition p-2 rounded text-white"
              >
                {card.buttonText}
              </button>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminInventoryDashboard;