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
      approved: "bg-green-500 text-white",
      rejected: "bg-red-500 text-white",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          styles[status] || "bg-gray-500 text-white"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPackageBadge = (packageType) => {
    const styles = {
      monthly: "bg-blue-500 text-white",
      quarterly: "bg-purple-500 text-white",
      annual: "bg-orange-500 text-white",
    };

    const labels = {
      monthly: "Monthly (30d)",
      quarterly: "Quarterly (90d)",
      annual: "Annual (365d)",
    };

    return (
      <span
        className={`px-3 py-1 rounded-lg text-sm font-semibold ${
          styles[packageType] || "bg-gray-500 text-white"
        }`}
      >
        {labels[packageType] || packageType}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <svg
              className="w-12 h-12 text-white mr-4"
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
            <h1 className="text-4xl font-bold text-white">
              Membership Renewal Requests
            </h1>
          </div>
          <p className="text-white text-opacity-90 text-lg">
            Review and manage student membership renewal requests
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            <p className="text-gray-300 mt-4">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-12 text-center">
            <svg
              className="w-20 h-20 text-gray-400 mx-auto mb-4"
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
            <h3 className="text-xl font-bold text-white mb-2">
              No Renewal Requests
            </h3>
            <p className="text-gray-400">
              There are no membership renewal requests at the moment.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700 bg-opacity-50 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      User Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Package
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Current Expiry
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Request Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {requests.map((request) => (
                    <tr
                      key={request._id}
                      className="hover:bg-gray-700 hover:bg-opacity-30 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {request.userName}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {request.email}
                      </td>
                      <td className="px-6 py-4">
                        {getPackageBadge(request.packageType)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(request.currentMembershipExpiry)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(request.requestDate)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request._id)}
                              disabled={processingId === request._id}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === request._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(request._id)}
                              disabled={processingId === request._id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === request._id ? "..." : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
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
            <div className="md:hidden divide-y divide-gray-700">
              {requests.map((request) => (
                <div key={request._id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {request.userName}
                      </h3>
                      <p className="text-gray-400 text-sm">{request.email}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Package:</span>
                      {getPackageBadge(request.packageType)}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Expiry:</span>
                      <span className="text-gray-300">
                        {formatDate(request.currentMembershipExpiry)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Request Date:</span>
                      <span className="text-gray-300">
                        {formatDate(request.requestDate)}
                      </span>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(request._id)}
                        disabled={processingId === request._id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request._id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={processingId === request._id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-white">{requests.length}</p>
            </div>
            <div className="bg-yellow-500 bg-opacity-20 rounded-xl p-6 text-center">
              <p className="text-yellow-300 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-400">
                {requests.filter((r) => r.status === "pending").length}
              </p>
            </div>
            <div className="bg-green-500 bg-opacity-20 rounded-xl p-6 text-center">
              <p className="text-green-300 text-sm mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-400">
                {requests.filter((r) => r.status === "approved").length}
              </p>
            </div>
            <div className="bg-red-500 bg-opacity-20 rounded-xl p-6 text-center">
              <p className="text-red-300 text-sm mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-400">
                {requests.filter((r) => r.status === "rejected").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRenewRequests;
