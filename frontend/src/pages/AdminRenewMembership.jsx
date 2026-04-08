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
      color: "from-blue-600-500 to-blue-600",
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
              Renew User Membership
            </h1>
            <p className="text-slate-700 text-base sm:text-lg">Select a membership plan to renew</p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="text-slate-700 mt-4">Loading user details...</p>
            </div>
          ) : error && !success ? (
            <div className="max-w-2xl mx-auto bg-red-600/20 border border-red-500/50 text-red-800 p-4 rounded-lg text-center text-sm sm:text-base">
              {error}
            </div>
          ) : user ? (
            <>
              {/* Success Message */}
              {success && (
                <div className="max-w-2xl mx-auto mb-8 bg-green-600/20 border border-green-500/50 text-green-800 p-6 rounded-lg flex items-center justify-center text-sm sm:text-base">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0"
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
                <div className="max-w-3xl mx-auto mb-12 backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                    User Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Name</p>
                      <p className="text-slate-900 text-base sm:text-lg font-semibold">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Email</p>
                      <p className="text-slate-900 text-base sm:text-lg font-semibold">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Current Plan</p>
                      <p className="text-slate-900 text-base sm:text-lg font-semibold capitalize">
                        {user.membershipType || "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Current Expiry</p>
                      <p className="text-slate-900 text-base sm:text-lg font-semibold">
                        {formatDate(user.membershipExpiry)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Status</p>
                      <p
                        className={`text-base sm:text-lg font-semibold ${
                          getMembershipStatus() === "Active"
                            ? "text-blue-600"
                            : "text-red-700"
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
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12">
                    Select Membership Plan
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12">
                    {membershipPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-blue-600/50 flex flex-col"
                      >
                        {/* Plan Header */}
                        <div
                          className={`bg-gradient-to-r ${plan.color} p-6 text-center`}
                        >
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                            {plan.name}
                          </h3>
                        </div>

                        {/* Features */}
                        <div className="p-6 flex flex-col flex-grow">
                          <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                            {plan.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start text-slate-700 text-xs sm:text-sm"
                              >
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Select Button */}
                          <button
                            onClick={() => handleRenew(plan.id)}
                            disabled={renewing}
                            className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 text-sm sm:text-base ${
                              renewing && selectedPlan === plan.id
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {renewing && selectedPlan === plan.id ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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
                <div className="text-center mb-12">
                  <button
                    onClick={() => navigate("/admin/memberships")}
                    disabled={renewing}
                    className="backdrop-blur-md bg-slate-100 border border-slate-300 hover:bg-white/15 hover:border-blue-600/50 text-slate-900 font-bold px-8 py-3 rounded-lg transition-all duration-300 inline-flex items-center text-sm sm:text-base"
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
                    Back to Memberships
                  </button>
                </div>
              )}

              {/* Info Section */}
              {!success && (
                <div className="max-w-4xl mx-auto backdrop-blur-md bg-blue-600/20 border border-blue-500/50 text-blue-800 p-6 rounded-lg text-xs sm:text-sm">
                  <h4 className="font-bold text-base sm:text-lg mb-3">📋 Admin Notes</h4>
                  <ul className="space-y-2">
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
    </div>
  );
};

export default AdminRenewMembership;




