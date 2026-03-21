import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MembershipManagement = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, expired
  const [blockingUserId, setBlockingUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("memberships"); // memberships, requests
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (userId, userName) => {
    setBlockingUserId(userId);
    setNotification("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/block/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      setUsers(users.map((u) =>
        u._id === userId ? { ...u, isBlocked: response.data.user.isBlocked } : u
      ));
      
      setNotification(
        `${userName} has been ${response.data.user.isBlocked ? "blocked" : "unblocked"} successfully.`
      );
      
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to update user status.",
      );
    } finally {
      setBlockingUserId(null);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/membership/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error("Failed to load renewal requests.");
    }
  };

  const handleApproveRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to approve this renewal request?")) {
      return;
    }

    setProcessingRequestId(requestId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/membership/approve/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotification("Renewal request approved successfully!");
      setTimeout(() => setNotification(""), 3000);
      fetchRequests();
      fetchUsers();
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to approve request."
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this renewal request?")) {
      return;
    }

    setProcessingRequestId(requestId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/membership/reject/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotification("Renewal request rejected successfully!");
      setTimeout(() => setNotification(""), 3000);
      fetchRequests();
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to reject request."
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getMembershipStatus = (expiryDate) => {
    if (!expiryDate) return "None";
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry > today ? "Active" : "Expired";
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = expiry - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
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

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    const status = getMembershipStatus(user.membershipExpiry);
    if (filter === "active") return status === "Active";
    if (filter === "expired") return status === "Expired" || status === "None";
    return true;
  });

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Membership Management
          </h1>
          <p className="text-gray-300">Renew and manage user memberships</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("memberships")}
            className={`pb-4 px-6 font-semibold transition-all duration-200 ${
              activeTab === "memberships"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            💳 Memberships
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-6 font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "requests"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            📋 Renewal Requests
            {requests.filter((r) => r.status === "pending").length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {requests.filter((r) => r.status === "pending").length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Buttons - Only show for Memberships tab */}
        {activeTab === "memberships" && (
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === "active"
                  ? "bg-green-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Active Memberships
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === "expired"
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Expired Memberships
            </button>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="mb-6 bg-green-500 bg-opacity-90 border border-green-600 text-white p-4 rounded-lg flex items-center">
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
            <span className="font-semibold">{notification}</span>
          </div>
        )}

        {/* Content */}
        {activeTab === "memberships" ? (
          <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              <p className="text-gray-300 mt-4">Loading memberships...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-4 rounded-lg inline-block">
                {error}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-300">
              No memberships found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Membership Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Days Left
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => {
                    const status = getMembershipStatus(user.membershipExpiry);
                    const daysLeft = getDaysRemaining(user.membershipExpiry);
                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-700 hover:bg-opacity-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.membershipType || "None"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(user.membershipExpiry)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              daysLeft === 0
                                ? "text-red-400"
                                : daysLeft <= 7
                                  ? "text-yellow-400"
                                  : "text-green-400"
                            }`}
                          >
                            {daysLeft} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              status === "Active"
                                ? "bg-green-500 bg-opacity-20 text-green-300"
                                : status === "Expired"
                                  ? "bg-red-500 bg-opacity-20 text-red-300"
                                  : "bg-gray-500 bg-opacity-20 text-gray-300"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              user.isBlocked
                                ? "bg-red-500 bg-opacity-20 text-red-300"
                                : "bg-green-500 bg-opacity-20 text-green-300"
                            }`}
                          >
                            {user.isBlocked ? "🔒 Blocked" : "✓ Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 flex justify-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/memberships/renew/${user._id}`)
                            }
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors duration-200 inline-flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
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
                            Renew
                          </button>
                          <button
                            onClick={() => handleBlockUnblock(user._id, user.name)}
                            disabled={blockingUserId === user._id}
                            className={`${
                              user.isBlocked
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            } px-3 py-2 rounded text-sm font-semibold transition-colors duration-200 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {blockingUserId === user._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></div>
                                Updating...
                              </>
                            ) : user.isBlocked ? (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M13 7H7v6h6V7z" />
                                </svg>
                                Unlock
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Block
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Current Expiry
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
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
                      <td className="px-6 py-4 text-center">
                        {request.status === "pending" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApproveRequest(request._id)}
                              disabled={processingRequestId === request._id}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                            >
                              {processingRequestId === request._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                  ...
                                </>
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              disabled={processingRequestId === request._id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                            >
                              {processingRequestId === request._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                  ...
                                </>
                              ) : (
                                "Reject"
                              )}
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
          )}

          {/* Request Stats */}
          {requests.length > 0 && (
            <div className="bg-gray-900 bg-opacity-50 border-t border-gray-700 p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Total Requests</p>
                <p className="text-white text-2xl font-bold">{requests.length}</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-300 text-sm mb-1">Pending</p>
                <p className="text-yellow-400 text-2xl font-bold">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-green-300 text-sm mb-1">Approved</p>
                <p className="text-green-400 text-2xl font-bold">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-red-300 text-sm mb-1">Rejected</p>
                <p className="text-red-400 text-2xl font-bold">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

        {/* Statistics - Only show for Memberships tab */}
        {activeTab === "memberships" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Memberships</p>
            <p className="text-white text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-green-400 text-2xl font-bold">
              {
                users.filter(
                  (u) => getMembershipStatus(u.membershipExpiry) === "Active",
                ).length
              }
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Expired</p>
            <p className="text-red-400 text-2xl font-bold">
              {
                users.filter(
                  (u) =>
                    getMembershipStatus(u.membershipExpiry) === "Expired" ||
                    getMembershipStatus(u.membershipExpiry) === "None",
                ).length
              }
            </p>
          </div>
        </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
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
    </div>
  );
};

export default MembershipManagement;
