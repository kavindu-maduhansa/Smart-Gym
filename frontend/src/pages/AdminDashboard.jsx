import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      label: "User Management",
      description: "View, edit and manage system users",
      route: "/admin/users",
      color: "from-blue-500 to-blue-600",
      icon: (
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: "Membership Management",
      description: "Renew and manage user memberships",
      route: "/admin/memberships",
      color: "from-orange-500 to-orange-600",
      icon: (
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      label: "Schedule Management",
      description: "Manage gym class schedules and sessions",
      route: "/admin/schedules",
      color: "from-purple-500 to-purple-600",
      icon: (
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: "Inventory Management",
      description: "Track gym equipment and stock levels",
      route: "/admin/inventory",
      color: "from-green-500 to-green-600",
      icon: (
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: "Supplement Store",
      description: "Manage supplements and product listings",
      route: "/admin/store",
      color: "from-pink-500 to-pink-600",
      icon: (
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Admin</h1>
          <p className="text-white text-opacity-90 text-lg">
            Manage your gym's operations efficiently from this dashboard
          </p>
        </div>

        {/* Action Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dashboardCards.map((card) => (
              <div
                key={card.label}
                onClick={() => navigate(card.route)}
                className={`bg-gradient-to-br ${card.color} rounded-2xl shadow-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
              >
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-20 rounded-full p-4 mr-6">
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {card.label}
                    </h3>
                    <p className="text-white text-opacity-90 mb-4">
                      {card.description}
                    </p>
                    <button className="bg-white text-gray-800 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
