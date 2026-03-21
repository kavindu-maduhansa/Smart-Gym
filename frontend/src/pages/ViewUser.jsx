import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6">
            <h2 className="text-3xl font-bold text-white text-center">
              User Details
            </h2>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                <p className="text-gray-300 mt-4">Loading user details...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : user ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-orange-500"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Full Name</p>
                      <p className="text-white text-lg font-semibold">
                        {user.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        Email Address
                      </p>
                      <p className="text-white text-lg font-semibold">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Role</p>
                      <p className="text-white text-lg font-semibold capitalize">
                        {user.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">User ID</p>
                      <p className="text-white text-lg font-semibold font-mono">
                        {user._id?.slice(-12)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Membership Information */}
                <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-orange-500"
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        Membership Type
                      </p>
                      <p className="text-white text-lg font-semibold">
                        {user.membershipType || "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Expiry Date</p>
                      <p className="text-white text-lg font-semibold">
                        {formatDate(user.membershipExpiry)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <p
                        className={`text-lg font-semibold ${
                          isExpired ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {membershipStatus}
                      </p>
                    </div>
                  </div>

                  {isExpired && membershipStatus !== "None" && (
                    <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
                      <p className="font-semibold">
                        ⚠ This user's membership has expired.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit User
                  </button>
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                    Back to Users
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
