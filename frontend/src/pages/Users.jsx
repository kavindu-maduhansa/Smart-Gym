import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setNotification(`User '${userName}' deleted successfully.`);
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setNotification(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : `Failed to delete user '${userName}'.`,
      );
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const getMembershipStatus = (expiryDate) => {
    if (!expiryDate) return "None";
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry > today ? "Active" : "Expired";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              User Management
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              View, edit, and manage all system users
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div className="mb-6 bg-orange/90 text-white p-4 rounded-lg shadow-lg flex items-center text-sm sm:text-base">
              <svg
                className="w-5 h-5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {notification}
            </div>
          )}

          {/* Content */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange"></div>
                <p className="text-gray-300 mt-4 text-sm sm:text-base">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="bg-red-600/20 border border-red-500/50 text-red-200 p-4 rounded-lg inline-block text-sm sm:text-base">
                  {error}
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm sm:text-base">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="backdrop-blur-md bg-white/10 border-b border-white/20">
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
                        Membership Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
                        Membership Expiry
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => {
                      const status = getMembershipStatus(user.membershipExpiry);
                      return (
                        <tr
                          key={user._id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-white text-sm">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                            {user.membershipType || "None"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                            {formatDate(user.membershipExpiry)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                status === "Active"
                                  ? "bg-green-500/20 text-green-300"
                                  : status === "Expired"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-gray-500/20 text-gray-300"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <button
                                onClick={() =>
                                  navigate(`/admin/users/${user._id}`)
                                }
                                className="bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 text-blue-200 px-3 py-1 rounded text-xs font-semibold transition-all duration-300"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/admin/users/edit/${user._id}`)
                                }
                                className="bg-orange/20 border border-orange/50 hover:bg-orange/30 text-orange px-3 py-1 rounded text-xs font-semibold transition-all duration-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user._id, user.name)}
                                className="bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-200 px-3 py-1 rounded text-xs font-semibold transition-all duration-300"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 hover:border-orange/50 text-white font-bold px-6 sm:px-8 py-3 rounded-lg transition-all duration-300 inline-flex items-center text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
