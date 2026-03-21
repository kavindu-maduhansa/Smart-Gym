import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MembershipManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, expired
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

  const getMembershipStatus = (expiryDate) => {
    if (!expiryDate) return "None";
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry > today ? "Active" : "Expired";
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = expiry - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
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

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    const status = getMembershipStatus(user.membershipExpiry);
    if (filter === "active") return status === "Active";
    if (filter === "expired") return status === "Expired" || status === "None";
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Membership Management
          </h1>
          <p className="text-gray-300">Renew and manage user memberships</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              filter === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              filter === "active"
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Active Memberships
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              filter === "expired"
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Expired Memberships
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              <p className="text-gray-300 mt-4">Loading memberships...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg inline-block">
                {error}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-300">
              No memberships found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Membership Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Days Left
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => {
                    const status = getMembershipStatus(user.membershipExpiry);
                    const daysLeft = getDaysRemaining(user.membershipExpiry);
                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-700 hover:bg-opacity-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.membershipType || "None"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(user.membershipExpiry)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              daysLeft === 0
                                ? "text-red-400"
                                : daysLeft <= 7
                                  ? "text-yellow-400"
                                  : "text-green-400"
                            }`}
                          >
                            {daysLeft} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              status === "Active"
                                ? "bg-green-500 bg-opacity-20 text-green-300"
                                : status === "Expired"
                                  ? "bg-red-500 bg-opacity-20 text-red-300"
                                  : "bg-gray-500 bg-opacity-20 text-gray-300"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/memberships/renew/${user._id}`)
                            }
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 inline-flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Renew
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Memberships</p>
            <p className="text-white text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-green-400 text-2xl font-bold">
              {
                users.filter(
                  (u) => getMembershipStatus(u.membershipExpiry) === "Active",
                ).length
              }
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Expired</p>
            <p className="text-red-400 text-2xl font-bold">
              {
                users.filter(
                  (u) =>
                    getMembershipStatus(u.membershipExpiry) === "Expired" ||
                    getMembershipStatus(u.membershipExpiry) === "None",
                ).length
              }
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
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
  );
};

export default MembershipManagement;
