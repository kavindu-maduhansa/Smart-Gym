import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMembers: 0,
    scheduledClasses: 0,
    equipmentItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/dashboard/stats", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardCards = [
    { label: "User Management", description: "View, edit and manage system users", route: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Membership Management", description: "Renew and manage user memberships", route: "/admin/memberships", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { label: "Schedule Management", description: "Manage gym class schedules and sessions", route: "/admin/schedules", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    
    // ✅ ONLY CHANGE IS HERE
    { label: "Inventory Management", description: "Track gym equipment and stock levels", route: "/admin/inventory-dashboard", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    
    { label: "Supplement Store", description: "Manage supplements and product listings", route: "/admin/store", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Admin Messages", description: "Review and manage Contact Us messages", route: "/admin/contact-messages", icon: "M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { label: "Order Management", description: "View and manage supplement orders from students", route: "/admin/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,127,17,0.1) 1px, transparent 1px), linear-gradient(rgba(255,127,17,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Welcome Section */}
          <div className="backdrop-blur-md bg-gradient-to-r from-orange/20 to-orange/10 border border-orange/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">Welcome Admin</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-300">
              Manage your gym's operations efficiently from this dashboard
            </p>
          </div>

          {/* Action Cards */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {dashboardCards.map((card) => (
                <div
                  key={card.label}
                  onClick={() => navigate(card.route)}
                  className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-orange/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange/20 cursor-pointer"
                >
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-orange/20 rounded-xl flex-shrink-0 group-hover:bg-orange/30 transition-colors duration-300">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                          {card.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 mb-4 group-hover:text-gray-200 transition-colors">
                          {card.description}
                        </p>
                        <button className="bg-orange hover:bg-orange/90 text-white font-bold px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm">
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 sm:mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Dashboard Stats</h2>
            {error && (
              <div className="mb-6 p-4 bg-red/20 border border-red/50 rounded-lg text-red-300">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
                { label: "Active Members", value: stats.activeMembers, icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
                { label: "Scheduled Classes", value: stats.scheduledClasses, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Equipment Items", value: stats.equipmentItems, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
              ].map((stat, idx) => (
                <div key={idx} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange/20 rounded-lg">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;