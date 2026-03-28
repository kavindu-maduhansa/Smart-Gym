import React from "react";
import { useNavigate } from "react-router-dom";
import RecentActivity from "../components/RecentActivity";

const AdminInventoryDashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const cards = [
    {
      title: "Add Machine",
      desc: "Create new entry for machine and target components",
      btn: "Add Item",
      onClick: () => handleNavigation("/admin/add-item"),
      icon: "M12 4v16m8-8H4",
    },
    {
      title: "Manage Machines",
      desc: "Edit and update existing equipment",
      btn: "Manage",
      onClick: () => handleNavigation("/admin/manage"),
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: "All Inventories",
      desc: "View complete inventory list",
      btn: "View All",
      onClick: () => handleNavigation("/admin/inventory"),
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      title: "Generate Report",
      desc: "Create inventory reports and analytics",
      btn: "Generate",
      onClick: () => alert("Report generation coming soon!"),
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background - Same as other admin pages */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Welcome Section */}
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 sm:mb-12">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6c0-.6.4-1 1-1h2M4 8v8M4 8h2m14-2V6c0-.6-.4-1-1-1h-2m4 2v8m0-8h-2M4 16v2c0 .6.4 1 1 1h2m-3-3h2m14 3v2c0 .6-.4 1-1 1h-2m4-3h-2M8 7h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2m0-10v10m8-10v10m0-10a2 2 0 012 2v6a2 2 0 01-2 2m-4-5h.01" />
              </svg>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">Inventory Management</h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-slate-700">
              Manage gym equipment and inventory efficiently
            </p>
          </div>

          {/* Action Cards */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {cards.map((card, i) => (
                <div
                  key={i}
                  onClick={card.onClick}
                  className="group relative backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 hover:bg-white/15 hover:border-blue-600/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/20 cursor-pointer"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 rounded-xl flex-shrink-0 group-hover:bg-blue-700/30 transition-colors duration-300 mb-4">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                      </svg>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 mb-4 group-hover:text-slate-800 transition-colors">
                      {card.desc}
                    </p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm">
                      {card.btn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOWER SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-12 sm:mt-16">

            {/* RECENT ACTIVITY */}
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h3>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-sm text-blue-600 hover:text-blue-600/80 transition font-semibold flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <RecentActivity />
            </div>

            {/* STATS */}
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Inventory Stats
              </h3>

              <div className="space-y-4">

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600/10 to-blue-600/5 border border-blue-600/20 rounded-xl hover:border-blue-600/50 transition">
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Total Items
                  </span>
                  <span className="text-2xl font-bold text-blue-600">150</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-400/20 rounded-xl hover:border-green-400/50 transition">
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available
                  </span>
                  <span className="text-2xl font-bold text-green-400">128</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-400/20 rounded-xl hover:border-red-400/50 transition">
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Out of Stock
                  </span>
                  <span className="text-2xl font-bold text-red-400">12</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-400/20 rounded-xl hover:border-yellow-400/50 transition">
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Maintenance
                  </span>
                  <span className="text-2xl font-bold text-yellow-400">10</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminInventoryDashboard;



