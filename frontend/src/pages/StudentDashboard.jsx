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
            }
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
      <div className="min-h-screen bg-blue-50 pt-24 flex items-center justify-center">
        <div className="text-slate-900 text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 pt-24 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const membershipStatus = getMembershipStatus();
  const isExpired = membershipStatus === "Expired";

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
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Welcome Section */}
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
              Welcome back, {user?.name}!
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-lg p-4 hover:bg-white/15 transition-all">
                <p className="text-slate-700 text-xs sm:text-sm font-semibold mb-2">
                  Membership Type
                </p>
                <p className="text-slate-900 text-lg sm:text-xl font-bold capitalize">
                  {user?.membershipType || "None"}
                </p>
              </div>
              <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-lg p-4 hover:bg-white/15 transition-all">
                <p className="text-slate-700 text-xs sm:text-sm font-semibold mb-2">
                  Expiry Date
                </p>
                <p className="text-slate-900 text-lg sm:text-xl font-bold">
                  {formatDate(user?.membershipExpiry)}
                </p>
              </div>
              <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-lg p-4 hover:bg-white/15 transition-all">
                <p className="text-slate-700 text-xs sm:text-sm font-semibold mb-2">Status</p>
                <p className={`text-lg sm:text-xl font-bold ${isExpired ? "text-red-400" : "text-blue-600"}`}>
                  {membershipStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Alert for Expired Membership */}
          {isExpired && (
            <div className="backdrop-blur-md bg-red-600/20 border border-red-500/50 text-slate-900 p-6 sm:p-8 rounded-2xl mb-8">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-bold text-lg sm:text-xl mb-2">Membership Expired!</p>
                  <p className="text-sm sm:text-base text-slate-800 mb-4">
                    Please renew your membership to continue enjoying our services.
                  </p>
                  <button onClick={() => navigate("/membership")} className="w-full bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-6 py-2 rounded-lg transition-all text-sm sm:text-base">
                    REQUEST RENEWAL NOW
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {[
              { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: "My Profile", desc: "View personal information", link: "/profile" },
              { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", title: "Membership", desc: "View membership details", link: "/membership" },
              { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", title: "My Bookings", desc: "View your bookings", link: "/my-bookings" },
              { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", title: "Settings", desc: "Edit profile & account", link: "/edit-profile" }
            ].map((item, idx) => (
              <div key={idx} onClick={() => navigate(item.link)} className="group relative backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-5 sm:p-6 hover:bg-white/15 hover:border-blue-600/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/20 cursor-pointer">
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-600/20 rounded-xl mb-4 group-hover:bg-blue-700/30 transition-colors">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-all">
                <p className="text-slate-500 text-xs sm:text-sm mb-2">Account Type</p>
                <p className="text-slate-900 text-lg sm:text-xl font-bold capitalize">{user?.role}</p>
              </div>
              <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-all">
                <p className="text-slate-500 text-xs sm:text-sm mb-2">Email</p>
                <p className="text-slate-900 text-lg sm:text-xl font-bold truncate">{user?.email}</p>
              </div>
              <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-all">
                <p className="text-slate-500 text-xs sm:text-sm mb-2">Member Since</p>
                <p className="text-slate-900 text-lg sm:text-xl font-bold">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;



