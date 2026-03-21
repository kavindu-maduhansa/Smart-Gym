import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMemberships: 0,
    expiredMemberships: 0,
  });
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Fetch admin profile
        const profileResponse = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setAdminName(profileResponse.data.name);

        // Fetch all users to calculate stats
        const usersResponse = await axios.get(
          "http://localhost:5000/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const users = usersResponse.data.users || [];
        const totalUsers = users.length;

        const today = new Date();
        let activeMemberships = 0;
        let expiredMemberships = 0;

        users.forEach((user) => {
          if (user.membershipExpiry) {
            const expiryDate = new Date(user.membershipExpiry);
            if (expiryDate > today) {
              activeMemberships++;
            } else {
              expiredMemberships++;
            }
          }
        });

        setStats({
          totalUsers,
          activeMemberships,
          expiredMemberships,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dashboardCards = [
    {
      label: "Manage Users",
      description: "View, edit and delete system users",
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
      label: "Manage Memberships",
      description: "Renew or update user memberships",
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome, {loading ? "Loading..." : adminName}
          </h1>
          <p className="text-white text-opacity-90 text-lg">
            Manage your gym's users and memberships efficiently
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-80 text-sm font-semibold mb-1">
                  Total Users
                </p>
                <p className="text-white text-4xl font-bold">
                  {loading ? "..." : stats.totalUsers}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-80 text-sm font-semibold mb-1">
                  Active Memberships
                </p>
                <p className="text-white text-4xl font-bold">
                  {loading ? "..." : stats.activeMemberships}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-80 text-sm font-semibold mb-1">
                  Expired Memberships
                </p>
                <p className="text-white text-4xl font-bold">
                  {loading ? "..." : stats.expiredMemberships}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* System Info */}
        <div className="mt-12 bg-gray-800 bg-opacity-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="text-sm mb-1">System Status</p>
              <p className="font-semibold text-green-400">
                ● All Systems Operational
              </p>
            </div>
            <div>
              <p className="text-sm mb-1">Last Updated</p>
              <p className="font-semibold">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
