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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showUpdateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showUpdateModal]);

  return (
    <div className="min-h-screen bg-blue-dark flex flex-col">
      {/* Update Modal (only once at root) */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="flex items-center justify-center w-full h-full">
            <div className="bg-blue-dark bg-opacity-90 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 relative">
              <button
                className="absolute top-2 right-3 text-orange text-2xl font-bold hover:text-white"
                onClick={() => setShowUpdateModal(false)}
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
                className="flex flex-col gap-4"
              >
                <label className="text-white font-semibold">
                  Name
                  <input
                    type="text"
                    className="mt-1 w-full rounded px-3 py-2 bg-black bg-opacity-40 text-white border border-orange focus:outline-none"
                    value={updateForm.name}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-white font-semibold">
                  Email
                  <input
                    type="email"
                    className="mt-1 w-full rounded px-3 py-2 bg-black bg-opacity-40 text-white border border-orange focus:outline-none"
                    value={updateForm.email}
                    onChange={(e) =>
                      setUpdateForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="text-white font-semibold">
                  Role
                  <select
                    className="mt-1 w-full rounded px-3 py-2 bg-black bg-opacity-40 text-white border border-orange focus:outline-none"
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
                  className="mt-4 bg-orange hover:bg-orange-dark text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl bg-black bg-opacity-40 rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-orange mb-6 text-center">
            All Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white mt-4">
              <thead>
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Membership Expiry</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-orange/30">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">
                      {user.membershipExpiry ? (
                        new Date(user.membershipExpiry).toLocaleDateString()
                      ) : (
                        <span className="italic text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
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
                        <button
                          className="bg-orange hover:bg-orange-dark text-white px-3 py-1 rounded text-xs font-semibold transition"
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("token");
                              const res = await axios.put(
                                `http://localhost:5000/api/users/renew/${user._id}`,
                                {},
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              );
                              setUsers((prev) =>
                                prev.map((u) =>
                                  u._id === user._id
                                    ? {
                                        ...u,
                                        membershipExpiry:
                                          res.data.membershipExpiry,
                                      }
                                    : u,
                                ),
                              );
                              setNotification(
                                `Membership for '${user.name}' renewed successfully.`,
                              );
                            } catch (err) {
                              setNotification(
                                err.response &&
                                  err.response.data &&
                                  err.response.data.message
                                  ? err.response.data.message
                                  : `Failed to renew membership for '${user.name}'.`,
                              );
                            }
                          }}
                        >
                          Renew
                        </button>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
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
                          Update
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
      {/* Notification */}
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
