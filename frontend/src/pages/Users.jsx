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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-300">
            View, edit, and manage all system users
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className="mb-6 bg-orange-500 bg-opacity-90 text-white p-4 rounded-lg shadow-lg flex items-center">
            <svg
              className="w-5 h-5 mr-3"
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
        <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              <p className="text-gray-300 mt-4">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg inline-block">
                {error}
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-300">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Membership Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Membership Expiry
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => {
                    const status = getMembershipStatus(user.membershipExpiry);
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500 bg-opacity-20 text-blue-300 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.membershipType || "None"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(user.membershipExpiry)}
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/admin/users/${user._id}`)
                              }
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors duration-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/admin/users/edit/${user._id}`)
                              }
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors duration-200"
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

export default Users;
