import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RenewMembership = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const navigate = useNavigate();

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
      popular: false,
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
      popular: true,
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
      popular: false,
    },
  ];

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

  const handleRenew = async (planType) => {
    setError("");
    setSuccess("");
    setRenewing(true);
    setSelectedPlan(planType);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/membership/request-renewal`,
        { packageType: planType.toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setSuccess(
        `Renewal request submitted successfully! Your ${planType} plan request has been sent to the admin for approval. You will be notified once it's approved.`,
      );
      setTimeout(() => {
        navigate("/student-dashboard");
      }, 3000);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to submit renewal request.",
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
      <div className="relative z-10 pt-20 pb-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Renew Your Membership
            </h1>
            <p className="text-slate-700 text-base sm:text-lg">
              Choose a plan that fits your fitness journey
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="text-slate-700 mt-4">Loading plans...</p>
            </div>
          ) : error && !success ? (
            <div className="max-w-2xl mx-auto bg-red-600/20 border border-red-500/50 text-red-800 p-4 rounded-lg text-center text-sm sm:text-base">
              {error}
            </div>
          ) : (
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

              {/* Current Membership Info */}
              {user && !success && (
                <div className="max-w-4xl mx-auto mb-8 backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                    Current Membership
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Plan Type</p>
                      <p className="text-slate-900 font-semibold text-sm sm:text-base capitalize">
                        {user.membershipType || "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Expiry Date</p>
                      <p className="text-slate-900 font-semibold text-sm sm:text-base">
                        {formatDate(user.membershipExpiry)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs sm:text-sm mb-2">Status</p>
                      <p
                        className={`font-semibold text-sm sm:text-base ${
                          new Date(user.membershipExpiry) > new Date()
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {new Date(user.membershipExpiry) > new Date()
                          ? "Active"
                          : "Expired"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Membership Plans */}
              {!success && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
                  {membershipPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-blue-600/50 ${
                        plan.popular ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-black" : ""
                      }`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="bg-blue-600/30 border-b border-blue-600/50 text-blue-600 text-center py-2 font-bold text-xs sm:text-sm">
                          ⭐ MOST POPULAR
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 border-b border-blue-600/30 p-6 sm:p-8 text-center">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                          {plan.name}
                        </h3>
                        <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
                          {plan.price}
                        </div>
                        <p className="text-slate-700 text-sm">
                          {plan.duration}
                        </p>
                        {plan.savings && (
                          <div className="mt-2 inline-block bg-blue-600/20 border border-blue-600/50 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-blue-600">
                            {plan.savings}
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="p-6 sm:p-8">
                        <ul className="space-y-3 mb-6">
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
                          className={`w-full py-2 sm:py-3 px-4 rounded-lg font-bold transition-all duration-200 text-sm sm:text-base ${
                            renewing && selectedPlan === plan.id
                              ? "bg-gray-600/50 cursor-not-allowed text-slate-500"
                              : plan.popular
                                ? "bg-blue-600 hover:bg-blue-700/90 text-slate-900"
                                : "backdrop-blur-md bg-slate-100 border border-slate-300 hover:bg-white/15 hover:border-blue-600/50 text-slate-900"
                          }`}
                        >
                          {renewing && selectedPlan === plan.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-current mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Select Plan"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Back Button */}
              {!success && (
                <div className="text-center">
                  <button
                    onClick={() => navigate("/student-dashboard")}
                    disabled={renewing}
                    className="bg-slate-100 border border-slate-300 hover:bg-white/15 hover:border-blue-600/50 text-slate-900 font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 inline-flex items-center text-sm sm:text-base"
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
              )}

              {/* Info Section */}
              {!success && (
                <div className="max-w-4xl mx-auto mt-12 bg-blue-600/20 border border-blue-500/50 text-blue-800 p-6 rounded-lg text-sm sm:text-base">
                  <h4 className="font-bold text-base sm:text-lg mb-3">
                    📋 Important Information
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li>
                      • Your new membership will be activated immediately upon
                      selection
                    </li>
                    <li>
                      • If you have an active membership, the new period will be
                      added to your current expiry date
                    </li>
                    <li>• All memberships are non-refundable once activated</li>
                    <li>
                      • For questions or support, please contact our front desk
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenewMembership;




