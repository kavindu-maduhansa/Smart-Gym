import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  // State for Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddModal]);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-50/75 backdrop-blur-sm transition-all"></div>
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-hidden">
              {/* Header */}
              <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 -mx-8 -mt-8 px-8 py-6 mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Add New User</h3>
                <button
                  className="text-slate-900/60 hover:text-slate-900 text-2xl font-bold transition"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({ name: "", email: "", password: "", role: "student" });
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setAddingUser(true);
                    const token = localStorage.getItem("token");
                    const response = await axios.post(
                      "http://localhost:5000/api/users/admin/create",
                      addForm,
                      { headers: { Authorization: `Bearer ${token}` } },
                    );
                    setUsers((prev) => [...prev, response.data.user]);
                    setNotification("User added successfully.");
                    setShowAddModal(false);
                    setAddForm({ name: "", email: "", password: "", role: "student" });
                  } catch (err) {
                    setNotification(
                      err.response &&
                        err.response.data &&
                        err.response.data.message
                        ? err.response.data.message
                        : "Failed to add user.",
                    );
                  } finally {
                    setAddingUser(false);
                  }
                }}
                className="flex flex-col gap-4 w-full"
              >
                <label className="text-slate-700 font-semibold text-sm">
                  Name
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-slate-700 font-semibold text-sm">
                  Email
                  <input
                    type="email"
                    className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-slate-700 font-semibold text-sm">
                  Password
                  <input
                    type="password"
                    className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="Minimum 8 characters"
                    required
                  />
                </label>
                <label className="text-slate-700 font-semibold text-sm">
                  Role
                  <select
                    className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    value={addForm.role}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, role: e.target.value }))
                    }
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                    <option value="trainer">Trainer</option>
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="mt-4 bg-blue-600 hover:bg-blue-700/90 disabled:bg-blue-600/50 text-slate-900 font-bold py-2 px-6 rounded-lg transition-all duration-300"
                >
                  {addingUser ? "Creating..." : "Create User"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
                User Management
              </h1>
              <p className="text-slate-500 text-base sm:text-lg">
                View, edit, and manage all system users
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold py-2 px-6 rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              + Add User
            </button>
          </div>

          {/* Notification */}
          {notification && (
            <div className="mb-6 bg-blue-600/90 text-slate-900 p-4 rounded-lg shadow-lg flex items-center text-sm sm:text-base">
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
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-slate-700 mt-4 text-sm sm:text-base">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="bg-red-600/20 border border-red-500/50 text-red-200 p-4 rounded-lg inline-block text-sm sm:text-base">
                  {error}
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm sm:text-base">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-800/90 to-gray-700/80 backdrop-blur-md sticky top-0 z-10">
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Membership Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Membership Expiry
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user, index) => {
                      const status = getMembershipStatus(user.membershipExpiry);
                      return (
                        <tr
                          key={user._id}
                          className={`${
                            index % 2 === 0
                              ? 'bg-gradient-to-r from-gray-800/40 to-gray-700/30'
                              : 'bg-gradient-to-r from-gray-800/20 to-gray-700/15'
                          } hover:from-gray-700/50 hover:to-gray-600/40 transition-all duration-200`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-slate-900 text-sm font-medium">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-700 text-sm">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin'
                                ? 'bg-blue-600/80 text-slate-900'
                                : user.role === 'trainer'
                                ? 'bg-blue-500/80 text-slate-900'
                                : 'bg-blue-400/80 text-slate-900'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-800 text-sm capitalize">
                            {user.membershipType || "None"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-800 text-sm">
                            {formatDate(user.membershipExpiry)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                status === "Active"
                                  ? "bg-green-500/80 text-slate-900"
                                  : status === "Expired"
                                    ? "bg-red-500/80 text-slate-900"
                                    : "bg-gray-500/80 text-slate-900"
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
                                className="bg-blue-600/80 border border-blue-500/50 hover:bg-blue-600 text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/admin/users/edit/${user._id}`)
                                }
                                className="bg-blue-600/80 border border-blue-600/50 hover:bg-blue-700 text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user._id, user.name)}
                                className="bg-red-600/80 border border-red-500/50 hover:bg-red-600 text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
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
              className="backdrop-blur-md bg-slate-100 border border-slate-300 hover:bg-white/15 hover:border-blue-600/50 text-slate-900 font-bold px-6 sm:px-8 py-3 rounded-lg transition-all duration-300 inline-flex items-center text-sm sm:text-base"
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




