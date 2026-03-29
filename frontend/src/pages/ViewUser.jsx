import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from "../services/apiClient";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const found = (response.data.users || []).find((u) => u._id === id);
        if (!found) {
          setError("User not found");
        } else {
          setUser(found);
          // If user is a trainer, fetch feedbacks
          if (found.role === "trainer") {
            try {
              const fbRes = await axios.get(apiClient.feedback.getForTrainer(found._id), {
                headers: { Authorization: `Bearer ${token}` }
              });
              setFeedbacks(fbRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
            } catch {}
          }
        }
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load user details.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const getMembershipStatus = () => {
    if (!user || !user.membershipExpiry) return "None";
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
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">
                User Details
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {loading ? (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  <p className="text-slate-700 mt-4">Loading user details...</p>
                </div>
              ) : error ? (
                <div className="bg-red-600/20 border border-red-500/50 text-red-800 p-4 rounded-lg text-center text-sm">
                  {error}
                </div>
              ) : user ? (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2">Full Name</p>
                        <p className="text-slate-900 text-base sm:text-lg font-semibold">
                          {user.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2">
                          Email Address
                        </p>
                        <p className="text-slate-900 text-base sm:text-lg font-semibold">
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2">Role</p>
                        <p className="text-slate-900 text-base sm:text-lg font-semibold capitalize">
                          {user.role}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2">User ID</p>
                        <p className="text-slate-900 text-base sm:text-lg font-semibold font-mono">
                          {user._id?.slice(-12)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Membership Information */}
                  <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Membership Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2">
                          Membership Type
                        </p>
                        <p className="text-slate-900 text-base sm:text-lg font-semibold capitalize">
                          {user.membershipType || "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2">Expiry Date</p>
                        <p className="text-slate-900 text-base sm:text-lg font-semibold">
                          {formatDate(user.membershipExpiry)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2">Status</p>
                        <p
                          className={`text-base sm:text-lg font-semibold ${
                            isExpired ? "text-red-700" : "text-blue-600"
                          }`}
                        >
                          {membershipStatus}
                        </p>
                      </div>
                    </div>

                    {isExpired && membershipStatus !== "None" && (
                      <div className="mt-4 bg-red-600/20 border border-red-500/50 text-red-800 p-3 rounded-lg text-xs sm:text-sm">
                        <p className="font-semibold">
                          ⚠ This user's membership has expired.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recent Feedbacks for Trainers */}
                  {user.role === "trainer" && feedbacks.length > 0 && (
                    <div className="backdrop-blur-md bg-slate-50 border border-blue-600/30 rounded-xl p-6 mt-6">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-4 flex items-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.631c.969 0 1.371 1.24.588 1.81l-5.37 3.905a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.538 1.118l-5.37-3.905a1 1 0 00-1.176 0l-5.37 3.905c-.783.57-1.838-.197-1.538-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.342 11.717c-.783-.57-.38-1.81.588-1.81h6.631a1 1 0 00.95-.69l2.036-6.29z" /></svg>
                        Recent Feedbacks
                      </h3>
                      <ul className="space-y-4">
                        {feedbacks.map(fb => (
                          <li key={fb._id} className="bg-blue-50/40 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-yellow-400 text-lg font-bold">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                              <span className="text-slate-500 text-xs ml-2">{new Date(fb.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-slate-900 font-semibold mb-1">{fb.studentId?.name || "Student"}</div>
                            <div className="text-slate-700 text-sm">{fb.comment || <span className="italic text-slate-600">No comment</span>}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
                    <button
                      onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                      className="bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit User
                    </button>
                    <button
                      onClick={() => navigate("/admin/users")}
                      className="backdrop-blur-md bg-slate-100 border border-slate-300 hover:bg-white/15 hover:border-blue-600/50 text-slate-900 font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
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
                      Back to Users
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

export default ViewUser;




