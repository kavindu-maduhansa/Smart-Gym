import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminRenewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/membership/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setRequests(response.data.requests);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to load renewal requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to approve this renewal request?")
    ) {
      return;
    }

    setProcessingId(requestId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/membership/approve/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      alert(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to approve request.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to reject this renewal request?")
    ) {
      return;
    }

    setProcessingId(requestId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/membership/reject/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      alert(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to reject request.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500 text-yellow-900",
      approved: "bg-green-500 text-slate-900",
      rejected: "bg-red-500 text-slate-900",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          styles[status] || "bg-gray-500 text-slate-900"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPackageBadge = (packageType) => {
    const styles = {
      monthly: "bg-blue-500 text-slate-900",
      quarterly: "bg-purple-500 text-slate-900",
      annual: "bg-blue-600 text-white",
    };

    const labels = {
      monthly: "Monthly (30d)",
      quarterly: "Quarterly (90d)",
      annual: "Annual (365d)",
    };

    return (
      <span
        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
          styles[packageType] || "bg-gray-500 text-slate-900"
        }`}
      >
        {labels[packageType] || packageType}
      </span>
    );
  };

  return (
    <div className="page-bg-base overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 ambient-gradient"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center mb-4 gap-4">
              <svg
                className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Membership Renewal Requests
                </h1>
                <p className="text-slate-700 text-sm sm:text-base mt-1">
                  Review and manage student membership renewal requests
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="text-slate-700 mt-4 text-sm sm:text-base">Loading requests...</p>
            </div>
          ) : error ? (
            <div className="bg-red-600/20 border border-red-500/50 text-red-800 p-4 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          ) : requests.length === 0 ? (
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-12 text-center">
              <svg
                className="w-20 h-20 text-slate-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                No Renewal Requests
              </h3>
              <p className="text-slate-500 text-sm sm:text-base">
                There are no membership renewal requests at the moment.
              </p>
            </div>
          ) : (
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="backdrop-blur-md bg-slate-100 border-b border-slate-300 sticky top-0 z-10">
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900/90 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900/90 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900/90 uppercase tracking-wider">
                        Package
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900/90 uppercase tracking-wider">
                        Current Expiry
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900/90 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900/90 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs sm:text-sm font-bold text-slate-900/90 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {requests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-900 font-medium text-sm">
                          {request.userName}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">
                          {request.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getPackageBadge(request.packageType)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">
                          {formatDate(request.currentMembershipExpiry)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">
                          {formatDate(request.requestDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {request.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(request._id)}
                                disabled={processingId === request._id}
                                className="bg-green-600/20 border border-green-500/50 hover:bg-green-600/30 text-green-800 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === request._id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(request._id)}
                                disabled={processingId === request._id}
                                className="bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-800 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === request._id ? "..." : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">
                              No actions available
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/10">
                {requests.map((request) => (
                  <div key={request._id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-slate-900 font-bold text-base sm:text-lg">
                          {request.userName}
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm">{request.email}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Package:</span>
                        {getPackageBadge(request.packageType)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Expiry:</span>
                        <span className="text-slate-700">
                          {formatDate(request.currentMembershipExpiry)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Request Date:</span>
                        <span className="text-slate-700">
                          {formatDate(request.requestDate)}
                        </span>
                      </div>
                    </div>

                    {request.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={processingId === request._id}
                          className="flex-1 bg-green-600/20 border border-green-500/50 hover:bg-green-600/30 text-green-800 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === request._id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={processingId === request._id}
                          className="flex-1 bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-800 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === request._id ? "..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && !error && requests.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 text-center">
                <p className="text-slate-500 text-xs sm:text-sm mb-2">Total Requests</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900">{requests.length}</p>
              </div>
              <div className="backdrop-blur-md bg-yellow-600/20 border border-yellow-500/50 rounded-2xl p-6 text-center">
                <p className="text-yellow-300 text-xs sm:text-sm mb-2">Pending</p>
                <p className="text-3xl sm:text-4xl font-bold text-yellow-400">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="backdrop-blur-md bg-green-600/20 border border-green-500/50 rounded-2xl p-6 text-center">
                <p className="text-green-700 text-xs sm:text-sm mb-2">Approved</p>
                <p className="text-3xl sm:text-4xl font-bold text-green-700">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <div className="backdrop-blur-md bg-red-600/20 border border-red-500/50 rounded-2xl p-6 text-center">
                <p className="text-red-700 text-xs sm:text-sm mb-2">Rejected</p>
                <p className="text-3xl sm:text-4xl font-bold text-red-700">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRenewRequests;



