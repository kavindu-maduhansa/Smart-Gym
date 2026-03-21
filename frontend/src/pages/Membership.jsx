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
          }
        );
        setUser(response.data);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load membership details."
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
        }
      );

      setSuccessMessage(response.data.message);
      setShowModal(false);
      setSelectedPackage("");
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to submit renewal request."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const membershipStatus = getMembershipStatus();
  const isExpired = membershipStatus === "Expired";
  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6">
            <h2 className="text-3xl font-bold text-white text-center">
              Membership Details
            </h2>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                <p className="text-gray-300 mt-4">Loading membership details...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : user ? (
              <div className="space-y-6">
                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 p-4 rounded-lg text-center">
                    {successMessage}
                  </div>
                )}

                {/* Expired Warning */}
                {isExpired && (
                  <div className="bg-red-500 bg-opacity-90 border-l-4 border-red-700 text-white p-6 rounded-lg">
                    <div className="flex items-start">
                      <svg
                        className="w-8 h-8 mr-4 flex-shrink-0"
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
                        <h3 className="text-xl font-bold mb-2">
                          Your membership has expired!
                        </h3>
                        <p className="text-white text-opacity-90">
                          Please renew your membership to continue enjoying our
                          services and facilities.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Warning (Low Days) */}
                {!isExpired && daysRemaining <= 7 && (
                  <div className="bg-yellow-500 bg-opacity-90 border-l-4 border-yellow-700 text-gray-900 p-6 rounded-lg">
                    <div className="flex items-start">
                      <svg
                        className="w-8 h-8 mr-4 flex-shrink-0"
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
                        <h3 className="text-xl font-bold mb-2">
                          Your membership is expiring soon!
                        </h3>
                        <p>
                          Only {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                          remaining. Renew now to avoid interruption.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Membership Card */}
                <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white text-2xl font-bold mb-1">
                        {user.name}
                      </h3>
                      <p className="text-white text-opacity-80">
                        Member ID: {user._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full font-bold ${
                        isExpired
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {membershipStatus}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-white text-opacity-80 text-sm mb-1">
                        Plan Type
                      </p>
                      <p className="text-white text-xl font-bold">
                        {user.membershipType || "None"}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-white text-opacity-80 text-sm mb-1">
                        Expiry Date
                      </p>
                      <p className="text-white text-xl font-bold">
                        {formatDate(user.membershipExpiry)}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-white text-opacity-80 text-sm mb-1">
                        Days Remaining
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          isExpired ? "text-red-200" : "text-white"
                        }`}
                      >
                        {isExpired ? "0" : daysRemaining}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits Section */}
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Membership Benefits
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-2 text-green-400 mt-1 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Access to all gym equipment and facilities
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-2 text-green-400 mt-1 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Free fitness assessment and personalized workout plans
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-2 text-green-400 mt-1 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Access to group fitness classes
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-2 text-green-400 mt-1 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Locker and shower facilities
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-2 text-green-400 mt-1 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Member discounts on personal training sessions
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Request Membership Renewal
                  </button>
                  <button
                    onClick={() => navigate("/student-dashboard")}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Package Selection Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6">
                <h3 className="text-2xl font-bold text-white text-center">
                  Select Membership Package
                </h3>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Monthly Package */}
                  <button
                    onClick={() => setSelectedPackage("monthly")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedPackage === "monthly"
                        ? "border-orange-500 bg-orange-500 bg-opacity-20"
                        : "border-gray-600 bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-white mb-2">
                        Monthly
                      </h4>
                      <p className="text-3xl font-bold text-orange-400 mb-2">
                        30 Days
                      </p>
                      <p className="text-gray-300 text-sm">
                        Perfect for short-term goals
                      </p>
                    </div>
                  </button>

                  {/* Quarterly Package */}
                  <button
                    onClick={() => setSelectedPackage("quarterly")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedPackage === "quarterly"
                        ? "border-orange-500 bg-orange-500 bg-opacity-20"
                        : "border-gray-600 bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-white mb-2">
                        Quarterly
                      </h4>
                      <p className="text-3xl font-bold text-orange-400 mb-2">
                        90 Days
                      </p>
                      <p className="text-gray-300 text-sm">
                        Great for consistent training
                      </p>
                    </div>
                  </button>

                  {/* Annual Package */}
                  <button
                    onClick={() => setSelectedPackage("annual")}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedPackage === "annual"
                        ? "border-orange-500 bg-orange-500 bg-opacity-20"
                        : "border-gray-600 bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-white mb-2">
                        Annual
                      </h4>
                      <p className="text-3xl font-bold text-orange-400 mb-2">
                        365 Days
                      </p>
                      <p className="text-gray-300 text-sm">
                        Best value for committed members
                      </p>
                    </div>
                  </button>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPackage("");
                      setError("");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestRenewal}
                    disabled={!selectedPackage || requestLoading}
                    className={`flex-1 font-semibold px-6 py-3 rounded-lg transition-colors duration-200 ${
                      !selectedPackage || requestLoading
                        ? "bg-gray-500 cursor-not-allowed text-gray-300"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
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
  );
};

export default Membership;
