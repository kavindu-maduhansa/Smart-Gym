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
      color: "from-orange-500 to-orange-600",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Renew Your Membership
          </h1>
          <p className="text-gray-300 text-lg">
            Choose a plan that fits your fitness journey
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-gray-300 mt-4">Loading plans...</p>
          </div>
        ) : error && !success ? (
          <div className="max-w-2xl mx-auto bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
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

            {/* Current Membership Info */}
            {user && !success && (
              <div className="max-w-2xl mx-auto mb-8 bg-gray-800 bg-opacity-90 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">
                  Current Membership
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Plan Type</p>
                    <p className="text-white font-semibold">
                      {user.membershipType || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Expiry Date</p>
                    <p className="text-white font-semibold">
                      {formatDate(user.membershipExpiry)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <p
                      className={`font-semibold ${
                        new Date(user.membershipExpiry) > new Date()
                          ? "text-green-400"
                          : "text-red-400"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {membershipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                      plan.popular ? "ring-4 ring-orange-500" : ""
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="bg-orange-500 text-white text-center py-2 font-bold text-sm">
                        ⭐ MOST POPULAR
                      </div>
                    )}

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
                            : plan.popular
                              ? "bg-orange-500 hover:bg-orange-600 text-white"
                              : "bg-gray-700 hover:bg-gray-600 text-white"
                        }`}
                      >
                        {renewing && selectedPlan === plan.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
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
                  Back to Dashboard
                </button>
              </div>
            )}

            {/* Info Section */}
            {!success && (
              <div className="max-w-4xl mx-auto mt-12 bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-200 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-2">
                  📋 Important Information
                </h4>
                <ul className="space-y-2 text-sm">
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
  );
};

export default RenewMembership;
