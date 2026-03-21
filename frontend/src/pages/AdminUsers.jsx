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
    if (showUpdateModal || showProfileModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showUpdateModal, showProfileModal]);

  return (
    <div
      className="min-h-screen pt-24 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/src/assets/gym-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-80 -z-10"></div>
      {/* Update Modal (only once at root) */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-[8px] transition-all"></div>
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="relative bg-orange bg-opacity-10 border border-orange rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 backdrop-blur-lg flex flex-col items-center">
              <button
                className="absolute top-4 right-6 text-orange text-2xl font-bold hover:text-orange-dark"
                onClick={() => setShowUpdateModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold text-orange mb-6 text-center">
                Update User
              </h3>
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
                <label className="text-orange-100 font-semibold">
                  Name
                  <input
                    type="text"
                    className="mt-1 w-full rounded px-3 py-2 bg-orange-50 bg-opacity-10 text-orange-100 border border-orange focus:outline-none"
                    value={updateForm.name}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-orange-100 font-semibold">
                  Email
                  <input
                    type="email"
                    className="mt-1 w-full rounded px-3 py-2 bg-orange-50 bg-opacity-10 text-orange-100 border border-orange focus:outline-none"
                    value={updateForm.email}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-orange-100 font-semibold">
                  Role
                  <select
                    className="mt-1 w-full rounded px-3 py-2 bg-orange-50 bg-opacity-10 text-orange-100 border border-orange focus:outline-none"
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
                  className="mt-4 bg-orange hover:bg-orange-dark text-white font-bold py-2 px-6 rounded-lg transition border border-orange shadow"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center flex-1">
        <div
          className="w-full max-w-7xl rounded-2xl p-12 border-2 border-orange/60"
          style={{ background: "transparent", boxShadow: "none" }}
        >
          <h2 className="text-4xl font-bold mb-10 text-center text-orange drop-shadow-lg">
            All Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white mt-4">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-center font-bold text-lg">
                    Name
                  </th>
                  <th className="px-6 py-3 text-center font-bold text-lg">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center font-bold text-lg">
                    Role
                  </th>
                  <th className="px-6 py-3 text-center font-bold text-lg">
                    Membership Expiry
                  </th>
                  <th className="px-6 py-3 text-center font-bold text-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-orange/30 align-middle"
                  >
                    <td className="px-6 py-3 text-center align-middle whitespace-nowrap">
                      {user.name}
                    </td>
                    <td className="px-6 py-3 text-center align-middle whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-3 text-center align-middle capitalize whitespace-nowrap">
                      {user.role}
                    </td>
                    <td className="px-6 py-3 text-center align-middle whitespace-nowrap">
                      {user.membershipExpiry ? (
                        new Date(user.membershipExpiry).toLocaleDateString()
                      ) : (
                        <span className="italic text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center align-middle">
                      <div className="flex justify-center gap-2">
                        <button
                          className="bg-orange hover:bg-orange-dark text-white px-3 py-1 rounded text-xs font-semibold transition border border-orange shadow"
                          onClick={() => {
                            setProfileUser(user);
                            setShowProfileModal(true);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* User Profile Modal (modern blue blur overlay) - only once at root */}
      {showProfileModal && profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Only blur overlay, no blue */}
          <div className="absolute inset-0 backdrop-blur-[8px] transition-all"></div>
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="relative bg-orange bg-opacity-10 border border-orange rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 backdrop-blur-lg flex flex-col items-center">
              <button
                className="absolute top-4 right-6 text-orange text-2xl font-bold hover:text-orange-dark"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold text-orange mb-6 text-center">
                User Profile
              </h3>
              <div className="flex flex-col gap-4 text-orange-100 w-full">
                <div>
                  <span className="font-semibold">Name:</span>{" "}
                  {profileUser.name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {profileUser.email}
                </div>
                <div>
                  <span className="font-semibold">Role:</span>{" "}
                  {profileUser.role}
                </div>
                <div>
                  <span className="font-semibold">Membership Expiry:</span>{" "}
                  {profileUser.membershipExpiry ? (
                    new Date(profileUser.membershipExpiry).toLocaleDateString()
                  ) : (
                    <span className="italic text-orange-200">N/A</span>
                  )}
                </div>
                {/* Action buttons in modal */}
                <div className="flex gap-3 mt-6 justify-center">
                  <button
                    className="bg-orange hover:bg-orange-dark text-white px-4 py-2 rounded font-semibold transition border border-orange shadow"
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
                    Update
                  </button>
                  <button
                    className="bg-orange-600 hover:bg-orange-800 text-white px-4 py-2 rounded font-semibold transition border border-orange shadow"
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
                    Renew
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition border border-orange shadow"
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
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-orange text-white px-6 py-3 rounded shadow-lg z-50 text-lg font-semibold animate-fade-in">
          {notification}
        </div>
      )}
      {/* Footer (Home page style) */}
      <footer className="bg-black border-t-2 border-orange py-8 mt-8">
        <div className="container mx-auto px-4 text-center text-white">
          <p>
            <span className="text-orange">&copy; 2026 Smart Gym.</span> All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminUsers;
