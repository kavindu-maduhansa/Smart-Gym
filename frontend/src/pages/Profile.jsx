import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
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
          },
        );
        setUser(response.data);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load profile.",
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

  const membershipStatus = getMembershipStatus();
  const isExpired = membershipStatus === "Expired";

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
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="backdrop-blur-md bg-gradient-to-r from-orange/20 to-orange/10 border-b border-orange/30 p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center">
                My Profile
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {loading ? (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange"></div>
                  <p className="text-gray-300 mt-4">Loading profile...</p>
                </div>
              ) : error ? (
                <div className="bg-red-600/20 border border-red-500/50 text-red-200 p-4 rounded-lg text-center">
                  {error}
                </div>
              ) : user ? (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">Full Name</p>
                        <p className="text-white text-base sm:text-lg font-semibold">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">Email Address</p>
                        <p className="text-white text-base sm:text-lg font-semibold">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">Account Type</p>
                        <p className="text-white text-base sm:text-lg font-semibold capitalize">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">Member Since</p>
                        <p className="text-white text-base sm:text-lg font-semibold">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Membership Information */}
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Membership Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">Membership Type</p>
                        <p className="text-white text-base sm:text-lg font-semibold capitalize">{user.membershipType || "None"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">Expiry Date</p>
                        <p className="text-white text-base sm:text-lg font-semibold">{formatDate(user.membershipExpiry)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">Status</p>
                        <p className={`text-base sm:text-lg font-semibold ${isExpired ? "text-red-400" : "text-orange"}`}>
                          {membershipStatus}
                        </p>
                      </div>
                    </div>

                    {isExpired && (
                      <div className="bg-red-600/20 border border-red-500/50 text-red-200 p-4 rounded-lg text-sm">
                        <p className="font-semibold">⚠ Your membership has expired. Please renew to continue enjoying our services.</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
                    <button onClick={() => navigate("/edit-profile")} className="bg-orange hover:bg-orange/90 text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                    <button onClick={() => navigate("/student-dashboard")} className="backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Dashboard
                    </button>
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

export default Profile;
