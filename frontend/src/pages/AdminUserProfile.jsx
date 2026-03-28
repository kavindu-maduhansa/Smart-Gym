import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const AdminUserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        // Backend does not have GET /api/users/:id, so fetch all and filter
        const response = await axios.get(`http://localhost:5000/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const found = (response.data.users || []).find((u) => u._id === id);
        if (!found) throw new Error("User not found");
        setUser(found);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load user profile.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
                User Profile
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {loading ? (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  <p className="text-slate-700 mt-4">Loading...</p>
                </div>
              ) : error ? (
                <div className="bg-red-600/20 border border-red-500/50 text-red-200 p-4 rounded-lg text-center text-sm">
                  {error}
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Full Name</p>
                    <p className="text-slate-900 text-base font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Email Address</p>
                    <p className="text-slate-900 text-base font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Account Type</p>
                    <p className="text-slate-900 text-base font-semibold capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Membership Type</p>
                    <p className="text-slate-900 text-base font-semibold capitalize">{user.membershipType || "None"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Membership Expiry</p>
                    <p className="text-slate-900 text-base font-semibold">{user.membershipExpiry || "N/A"}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;



