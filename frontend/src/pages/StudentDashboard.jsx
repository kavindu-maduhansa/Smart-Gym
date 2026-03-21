import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getMembershipStatus = () => {
    if (!user || !user.membershipExpiry) return "Unknown";
    const expiryDate = new Date(user.membershipExpiry);
    const today = new Date();
    return expiryDate > today ? "Active" : "Expired";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const membershipStatus = getMembershipStatus();
  const isExpired = membershipStatus === "Expired";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user?.name}!
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-sm font-semibold mb-1">
                Membership Type
              </p>
              <p className="text-white text-2xl font-bold">
                {user?.membershipType || "None"}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-sm font-semibold mb-1">
                Expiry Date
              </p>
              <p className="text-white text-2xl font-bold">
                {formatDate(user?.membershipExpiry)}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-sm font-semibold mb-1">Status</p>
              <p
                className={`text-2xl font-bold ${
                  isExpired ? "text-red-200" : "text-green-200"
                }`}
              >
                {membershipStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Alert for Expired Membership */}
        {isExpired && (
          <div className="bg-red-500 bg-opacity-90 border-l-4 border-red-700 text-white p-4 rounded-lg mb-8">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-semibold">
                Your membership has expired! Please renew to continue enjoying
                our services.
              </p>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: My Profile */}
          <div
            onClick={() => navigate("/profile")}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-4">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">My Profile</h3>
              <p className="text-white text-sm opacity-90 mb-4">
                View your personal information
              </p>
              <button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                View Profile
              </button>
            </div>
          </div>

          {/* Card 2: Membership Details */}
          <div
            onClick={() => navigate("/membership")}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-4">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Membership Details
              </h3>
              <p className="text-white text-sm opacity-90 mb-4">
                View membership information
              </p>
              <button className="bg-white text-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200">
                View Membership
              </button>
            </div>
          </div>

          {/* Card 3: Schedules Only */}
          <div
            onClick={() => navigate("/schedule-management")}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-4">
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
                    d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Schedules Only
              </h3>
              <p className="text-white text-sm opacity-90 mb-4">
                View your schedules
              </p>
              <button className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors duration-200">
                View Schedules
              </button>
            </div>
          </div>

          {/* Card 4: Account Settings */}
          <div
            onClick={() => navigate("/edit-profile")}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-4 mb-4">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Account Settings
              </h3>
              <p className="text-white text-sm opacity-90 mb-4">
                Update personal information
              </p>
              <button className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors duration-200">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-gray-800 bg-opacity-50 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-1">Account Type</p>
              <p className="text-white text-xl font-bold">{user?.role}</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-1">Email</p>
              <p className="text-white text-xl font-bold">{user?.email}</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-1">Member Since</p>
              <p className="text-white text-xl font-bold">
                {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
