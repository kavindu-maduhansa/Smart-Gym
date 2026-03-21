import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminRenewMembership = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const membershipPlans = [
    {
      id: "Monthly",
      name: "Monthly Plan",
      duration: "1 Month",
      price: "$50",
      features: [
        "Access to all gym equipment",
        "Free fitness assessment",
        "Locker facilities",
        "1 guest pass per month",
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "Quarterly",
      name: "Quarterly Plan",
      duration: "3 Months",
      price: "$135",
      savings: "Save $15",
      features: [
        "All Monthly Plan features",
        "3 guest passes per quarter",
        "10% discount on personal training",
        "Free nutrition consultation",
      ],
      color: "from-green-500 to-green-600",
    },
    {
      id: "Annual",
      name: "Annual Plan",
      duration: "12 Months",
      price: "$480",
      savings: "Save $120",
      features: [
        "All Quarterly Plan features",
        "Unlimited guest passes",
        "20% discount on personal training",
        "Free monthly massage session",
        "Priority class booking",
      ],
      color: "from-orange-500 to-orange-600",
    },
  ];

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

  const handleRenew = async (planType) => {
    setError("");
    setSuccess("");
    setRenewing(true);
    setSelectedPlan(planType);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/renew/${id}`,
        { membershipType: planType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setSuccess(
        `Membership renewed successfully for ${user.name} with ${planType} plan!`,
      );
      setTimeout(() => {
        navigate("/admin/memberships");
      }, 2500);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to renew membership.",
      );
      setSelectedPlan("");
    } finally {
      setRenewing(false);
    }
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

  const getMembershipStatus = () => {
    if (!user || !user.membershipExpiry) return "None";
    const expiryDate = new Date(user.membershipExpiry);
    const today = new Date();
    return expiryDate > today ? "Active" : "Expired";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Renew User Membership
          </h1>
          <p className="text-gray-300">Select a membership plan to renew</p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-gray-300 mt-4">Loading user details...</p>
          </div>
        ) : error && !success ? (
          <div className="max-w-2xl mx-auto bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : user ? (
          <>
            {/* Success Message */}
            {success && (
              <div className="max-w-2xl mx-auto mb-8 bg-green-500 bg-opacity-90 border border-green-600 text-white p-6 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">{success}</span>
              </div>
            )}

            {/* User Information */}
            {!success && (
              <div className="max-w-3xl mx-auto mb-8 bg-gray-800 bg-opacity-90 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Name</p>
                    <p className="text-white font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Plan</p>
                    <p className="text-white font-semibold">
                      {user.membershipType || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Expiry</p>
                    <p className="text-white font-semibold">
                      {formatDate(user.membershipExpiry)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <p
                      className={`font-semibold ${
                        getMembershipStatus() === "Active"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {getMembershipStatus()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Membership Plans */}
            {!success && (
              <>
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  Select Membership Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {membershipPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105"
                    >
                      {/* Plan Header */}
                      <div
                        className={`bg-gradient-to-r ${plan.color} p-6 text-center`}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {plan.name}
                        </h3>
                        <div className="text-4xl font-bold text-white mb-1">
                          {plan.price}
                        </div>
                        <p className="text-white text-opacity-90 text-sm">
                          {plan.duration}
                        </p>
                        {plan.savings && (
                          <div className="mt-2 inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                            {plan.savings}
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="p-6">
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start text-gray-300"
                            >
                              <svg
                                className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Select Button */}
                        <button
                          onClick={() => handleRenew(plan.id)}
                          disabled={renewing}
                          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                            renewing && selectedPlan === plan.id
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-orange-600 text-white"
                          }`}
                        >
                          {renewing && selectedPlan === plan.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Renew with this Plan"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Back Button */}
            {!success && (
              <div className="text-center">
                <button
                  onClick={() => navigate("/admin/memberships")}
                  disabled={renewing}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
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
                  Back to Memberships
                </button>
              </div>
            )}

            {/* Info Section */}
            {!success && (
              <div className="max-w-4xl mx-auto mt-12 bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-200 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-2">📋 Admin Notes</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • The new membership period will be calculated from today's
                    date
                  </li>
                  <li>
                    • If the user has an active membership, consider the current
                    expiry date before renewing
                  </li>
                  <li>• The user will be notified of the membership renewal</li>
                  <li>
                    • All changes are logged in the system for audit purposes
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminRenewMembership;
