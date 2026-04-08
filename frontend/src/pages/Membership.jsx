import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Membership = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
            : "Failed to load membership details.",
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

  const getDaysRemaining = () => {
    if (!user || !user.membershipExpiry) return 0;
    const expiryDate = new Date(user.membershipExpiry);
    const today = new Date();
    const timeDiff = expiryDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? daysRemaining : 0;
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

  const handleRequestRenewal = async () => {
    if (!selectedPackage) {
      setError("Please select a package type.");
      return;
    }

    setRequestLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/membership/request-renewal",
        { packageType: selectedPackage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccessMessage(response.data.message);
      setShowModal(false);
      setSelectedPackage("");
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to submit renewal request.",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const membershipStatus = getMembershipStatus();
  const isExpired = membershipStatus === "Expired";
  const daysRemaining = getDaysRemaining();

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
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">
                Membership Details
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {loading ? (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  <p className="text-slate-700 mt-4">
                    Loading membership details...
                  </p>
                </div>
              ) : error && !showModal ? (
                <div className="bg-red-600/20 border border-red-500/50 text-red-800 p-4 rounded-lg text-center">
                  {error}
                </div>
              ) : user ? (
                <div className="space-y-6">
                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-green-600/20 border border-green-500/50 text-green-800 p-4 rounded-lg text-center text-sm sm:text-base">
                      {successMessage}
                    </div>
                  )}

                  {/* Expired Warning */}
                  {isExpired && (
                    <div className="bg-red-600/20 border border-red-500/30 text-red-800 p-6 rounded-xl">
                      <div className="flex items-start">
                        <svg
                          className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 flex-shrink-0 mt-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-2">
                            Your membership has expired!
                          </h3>
                          <p className="text-red-800 text-sm sm:text-base">
                            Please renew your membership to continue enjoying our
                            services and facilities.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Warning (Low Days) */}
                  {!isExpired && daysRemaining <= 7 && daysRemaining > 0 && (
                    <div className="bg-amber-600/20 border border-amber-500/30 text-amber-200 p-6 rounded-xl">
                      <div className="flex items-start">
                        <svg
                          className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 flex-shrink-0 mt-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold mb-2">
                            Your membership is expiring soon!
                          </h3>
                          <p className="text-amber-100 text-sm sm:text-base">
                            Only {daysRemaining} day
                            {daysRemaining !== 1 ? "s" : ""} remaining. Renew now
                            to avoid interruption.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Membership Card */}
                  <div className="backdrop-blur-md bg-gradient-to-br from-blue-600/30 to-blue-600/10 border border-blue-600/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                          {user.name}
                        </h3>
                        <p className="text-blue-800 text-sm sm:text-base">
                          Member ID: {user._id?.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full font-bold text-sm sm:text-base flex-shrink-0 ${
                          isExpired
                            ? "bg-red-600/30 border border-red-500/50 text-red-800"
                            : "bg-green-600/30 border border-green-500/50 text-green-800"
                        }`}
                      >
                        {membershipStatus}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-lg p-4">
                        <p className="text-slate-700 text-xs sm:text-sm mb-2">
                          Plan Type
                        </p>
                        <p className="text-slate-900 text-lg sm:text-xl font-bold capitalize">
                          {user.membershipType || "None"}
                        </p>
                      </div>
                      <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-lg p-4">
                        <p className="text-slate-700 text-xs sm:text-sm mb-2">
                          Expiry Date
                        </p>
                        <p className="text-slate-900 text-lg sm:text-xl font-bold">
                          {formatDate(user.membershipExpiry)}
                        </p>
                      </div>
                      <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-lg p-4">
                        <p className="text-slate-700 text-xs sm:text-sm mb-2">
                          Days Remaining
                        </p>
                        <p
                          className={`text-lg sm:text-xl font-bold ${
                            isExpired ? "text-red-700" : "text-blue-600"
                          }`}
                        >
                          {isExpired ? "0" : daysRemaining}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Section */}
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Membership Benefits
                    </h3>
                    <ul className="space-y-3 text-slate-700 text-sm sm:text-base">
                      <li className="flex items-start">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Access to all gym equipment and facilities</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Free fitness assessment and personalized workout plans</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Access to group fitness classes</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Locker and shower facilities</span>
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Member discounts on personal training sessions</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Request Membership Renewal
                    </button>
                    <button
                      onClick={() => navigate("/student-dashboard")}
                      className="flex-1 backdrop-blur-md bg-slate-100 border border-slate-300 hover:bg-white/15 hover:border-blue-600/50 text-slate-900 font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
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
              ) : null}
            </div>
          </div>

          {/* Package Selection Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-blue-50/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Modal Header */}
                <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 p-6 sm:p-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
                    Select Membership Package
                  </h3>
                </div>

                {/* Modal Content */}
                <div className="p-6 sm:p-8">
                  {error && (
                    <div className="bg-red-600/20 border border-red-500/50 text-red-800 p-3 sm:p-4 rounded-lg mb-4 text-xs sm:text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {/* Monthly Package */}
                    <button
                      onClick={() => setSelectedPackage("monthly")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedPackage === "monthly"
                          ? "border-blue-600/50 bg-blue-600/20"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-center">
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                          Monthly
                        </h4>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                          30 Days
                        </p>
                        <p className="text-slate-700 text-xs sm:text-sm">
                          Perfect for short-term goals
                        </p>
                      </div>
                    </button>

                    {/* Quarterly Package */}
                    <button
                      onClick={() => setSelectedPackage("quarterly")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedPackage === "quarterly"
                          ? "border-blue-600/50 bg-blue-600/20"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-center">
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                          Quarterly
                        </h4>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                          90 Days
                        </p>
                        <p className="text-slate-700 text-xs sm:text-sm">
                          Great for consistent training
                        </p>
                      </div>
                    </button>

                    {/* Annual Package */}
                    <button
                      onClick={() => setSelectedPackage("annual")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedPackage === "annual"
                          ? "border-blue-600/50 bg-blue-600/20"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-center">
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                          Annual
                        </h4>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                          365 Days
                        </p>
                        <p className="text-slate-700 text-xs sm:text-sm">
                          Best value for committed members
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex gap-3 sm:gap-4">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedPackage("");
                        setError("");
                      }}
                      className="flex-1 backdrop-blur-md bg-slate-100 border border-slate-300 hover:bg-white/15 text-slate-900 font-bold px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestRenewal}
                      disabled={!selectedPackage || requestLoading}
                      className={`flex-1 font-bold px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                        !selectedPackage || requestLoading
                          ? "bg-gray-600/50 cursor-not-allowed text-slate-500"
                          : "bg-blue-600 hover:bg-blue-700/90 text-slate-900"
                      }`}
                    >
                      {requestLoading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Membership;



