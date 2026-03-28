import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateUser, setUpdateUser] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    role: "student",
  });

  // State for Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [addingUser, setAddingUser] = useState(false);

  // Fetch users on mount
  useEffect(() => {
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
    fetchUsers();
  }, []);

  // Notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Modal for user profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showUpdateModal || showProfileModal || showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showUpdateModal, showProfileModal, showAddModal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-50/75 backdrop-blur-sm transition-all"></div>
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-hidden">
              {/* Header */}
              <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 -mx-8 -mt-8 px-8 py-6 mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Update User</h3>
                <button
                  className="text-slate-900/60 hover:text-slate-900 text-2xl font-bold transition"
                  onClick={() => setShowUpdateModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const token = localStorage.getItem("token");
                    await axios.put(
                      `http://localhost:5000/api/users/${updateUser._id}`,
                      updateForm,
                      { headers: { Authorization: `Bearer ${token}` } },
                    );
                    setUsers((prev) =>
                      prev.map((u) =>
                        u._id === updateUser._id ? { ...u, ...updateForm } : u,
                      ),
                    );
                    setNotification("User updated successfully.");
                    setShowUpdateModal(false);
                  } catch (err) {
                    setNotification(
                      err.response &&
                        err.response.data &&
                        err.response.data.message
                        ? err.response.data.message
                        : "Failed to update user.",
                    );
                  }
                }}
                className="flex flex-col gap-4 w-full"
              >
                <label className="text-slate-700 font-semibold text-sm">
                  Name
                  <input
                    type="text"
                    className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    value={updateForm.name}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-slate-700 font-semibold text-sm">
                  Email
                  <input
                    type="email"
                    className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    value={updateForm.email}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-slate-700 font-semibold text-sm">
                  Role
                  <select
                    className="mt-2 w-full rounded-lg px-4 py-2 bg-slate-100 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                    value={updateForm.role}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, role: e.target.value }))
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
                  className="mt-4 bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold py-2 px-6 rounded-lg transition-all duration-300"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-50/75 backdrop-blur-sm transition-all"></div>
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-hidden">
              {/* Header */}
              <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 -mx-8 -mt-8 px-8 py-6 mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">User Profile</h3>
                <button
                  className="text-slate-900/60 hover:text-slate-900 text-2xl font-bold transition"
                  onClick={() => setShowProfileModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col gap-4 text-slate-900 w-full mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-500 text-xs mb-1">Name</p>
                  <p className="font-semibold">{profileUser.name}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-500 text-xs mb-1">Email</p>
                  <p className="font-semibold">{profileUser.email}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-500 text-xs mb-1">Role</p>
                  <p className="font-semibold capitalize">{profileUser.role}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-500 text-xs mb-1">Membership Expiry</p>
                  <p className="font-semibold">
                    {profileUser.membershipExpiry ? (
                      new Date(profileUser.membershipExpiry).toLocaleDateString()
                    ) : (
                      <span className="italic text-slate-500">N/A</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    profileUser.isBlocked
                      ? "bg-green-600/20 border border-green-500/50 text-green-200 hover:bg-green-600/30"
                      : "bg-yellow-600/20 border border-yellow-500/50 text-yellow-200 hover:bg-yellow-600/30"
                  }`}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const res = await axios.put(
                        `http://localhost:5000/api/users/block/${profileUser._id}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } },
                      );
                      setUsers((prev) =>
                        prev.map((u) =>
                          u._id === profileUser._id
                            ? { ...u, isBlocked: res.data.user.isBlocked }
                            : u,
                        ),
                      );
                      setProfileUser((u) =>
                        u ? { ...u, isBlocked: res.data.user.isBlocked } : u,
                      );
                      setNotification(
                        `User '${profileUser.name}' ${res.data.user.isBlocked ? "blocked" : "unblocked"} successfully.`,
                      );
                    } catch (err) {
                      setNotification(
                        err.response &&
                          err.response.data &&
                          err.response.data.message
                          ? err.response.data.message
                          : `Failed to ${profileUser.isBlocked ? "unblock" : "block"} user '${profileUser.name}'.`,
                      );
                    }
                  }}
                >
                  {profileUser.isBlocked ? "Unblock" : "Block"}
                </button>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                  onClick={() => {
                    setUpdateUser(profileUser);
                    setUpdateForm({
                      name: profileUser.name,
                      email: profileUser.email,
                      role: profileUser.role,
                    });
                    setShowUpdateModal(true);
                    setShowProfileModal(false);
                  }}
                >
                  Edit User
                </button>
                <button
                  className="w-full bg-blue-600/20 border border-blue-500/50 text-blue-200 hover:bg-blue-600/30 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const res = await axios.put(
                        `http://localhost:5000/api/users/renew/${profileUser._id}`,
                        {},
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        },
                      );
                      setUsers((prev) =>
                        prev.map((u) =>
                          u._id === profileUser._id
                            ? {
                                ...u,
                                membershipExpiry: res.data.membershipExpiry,
                              }
                            : u,
                        ),
                      );
                      setNotification(
                        `Membership for '${profileUser.name}' renewed successfully.`,
                      );
                      setShowProfileModal(false);
                    } catch (err) {
                      setNotification(
                        err.response &&
                          err.response.data &&
                          err.response.data.message
                          ? err.response.data.message
                          : `Failed to renew membership for '${profileUser.name}'.`,
                      );
                    }
                  }}
                >
                  Renew Membership
                </button>
                <button
                  className="w-full bg-red-600/20 border border-red-500/50 text-red-200 hover:bg-red-600/30 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                  onClick={async () => {
                    if (
                      !window.confirm(
                        `Are you sure you want to delete ${profileUser.name}?`,
                      )
                    )
                      return;
                    try {
                      const token = localStorage.getItem("token");
                      await axios.delete(
                        `http://localhost:5000/api/users/${profileUser._id}`,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        },
                      );
                      setUsers((prev) =>
                        prev.filter((u) => u._id !== profileUser._id),
                      );
                      setNotification(
                        `User '${profileUser.name}' deleted successfully.`,
                      );
                      setShowProfileModal(false);
                    } catch (err) {
                      setNotification(
                        err.response &&
                          err.response.data &&
                          err.response.data.message
                          ? err.response.data.message
                          : `Failed to delete user '${profileUser.name}'.`,
                      );
                    }
                  }}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-7xl">
            {/* Header */}
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">
                  All Users
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold py-2 px-6 rounded-lg transition-all duration-300 whitespace-nowrap"
                >
                  + Add User
                </button>
              </div>
            </div>

            {/* Loading/Error States */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-slate-700 mt-4">Loading users...</p>
              </div>
            ) : error ? (
              <div className="bg-red-600/20 border border-red-500/50 text-red-200 p-4 rounded-lg text-center mb-8">
                {error}
              </div>
            ) : (
              <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-slate-900">
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
                        Membership Expiry
                      </th>
                      <th className="px-6 py-4 text-center text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user, index) => (
                      <tr
                        key={user._id}
                        className={`${
                          index % 2 === 0 
                            ? 'bg-gradient-to-r from-gray-800/40 to-gray-700/30' 
                            : 'bg-gradient-to-r from-gray-800/20 to-gray-700/15'
                        } hover:from-gray-700/50 hover:to-gray-600/40 transition-all duration-200`}
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap font-medium">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-700">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap capitalize">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-blue-600/80 text-slate-900' 
                              : user.role === 'trainer'
                              ? 'bg-blue-500/80 text-slate-900'
                              : 'bg-blue-400/80 text-slate-900'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-800">
                          {user.membershipExpiry ? (
                            new Date(user.membershipExpiry).toLocaleDateString()
                          ) : (
                            <span className="italic text-slate-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              className="bg-blue-600/80 hover:bg-blue-600 text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border border-blue-500/50"
                              onClick={() => {
                                setProfileUser(user);
                                setShowProfileModal(true);
                              }}
                            >
                              View
                            </button>
                            <button
                              className="bg-blue-600/80 hover:bg-blue-700 text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border border-blue-600/50"
                              onClick={() => {
                                setUpdateUser(user);
                                setUpdateForm({
                                  name: user.name,
                                  email: user.email,
                                  role: user.role,
                                });
                                setShowUpdateModal(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-600/80 hover:bg-red-600 text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border border-red-500/50"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `Are you sure you want to delete ${user.name}?`,
                                  )
                                )
                                  return;
                                try {
                                  const token = localStorage.getItem("token");
                                  await axios.delete(
                                    `http://localhost:5000/api/users/${user._id}`,
                                    {
                                      headers: { Authorization: `Bearer ${token}` },
                                    },
                                  );
                                  setUsers((prev) =>
                                    prev.filter((u) => u._id !== user._id),
                                  );
                                  setNotification(
                                    `User '${user.name}' deleted successfully.`,
                                  );
                                } catch (err) {
                                  setNotification(
                                    err.response &&
                                      err.response.data &&
                                      err.response.data.message
                                      ? err.response.data.message
                                      : `Failed to delete user '${user.name}'.`,
                                  );
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-28 left-1/2 transform -translate-x-1/2 bg-blue-600/90 text-slate-900 px-6 py-3 rounded-lg shadow-2xl z-50 text-sm sm:text-base font-semibold animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;




