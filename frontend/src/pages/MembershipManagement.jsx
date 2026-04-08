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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px"}}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center mb-4 gap-4">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Membership Management
                </h1>
                <p className="text-slate-700 text-sm sm:text-base mt-1">Renew and manage user memberships</p>
              </div>
            </div>
          </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-300 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("memberships")}
            className={`pb-4 px-6 font-semibold transition-all duration-200 ${
              activeTab === "memberships"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            💳 Memberships
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-6 font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "requests"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            📋 Renewal Requests
            {requests.filter((r) => r.status === "pending").length > 0 && (
              <span className="bg-red-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
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
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === "active"
                  ? "bg-green-600 text-slate-900"
                  : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Active Memberships
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === "expired"
                  ? "bg-red-600 text-slate-900"
                  : "bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Expired Memberships
            </button>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="mb-6 bg-green-500 bg-opacity-90 border border-green-600 text-slate-900 p-4 rounded-lg flex items-center">
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
          <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="text-slate-700 mt-4">Loading memberships...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-800 p-4 rounded-lg inline-block">
                {error}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-700">
              No memberships found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-200/80 sticky top-0 z-10 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Membership Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Days Left
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300/50">
                  {filteredUsers.map((user) => {
                    const status = getMembershipStatus(user.membershipExpiry);
                    const daysLeft = getDaysRemaining(user.membershipExpiry);
                    return (
                      <tr
                        key={user._id}
                        className="bg-white hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 capitalize">
                          {user.membershipType || "None"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                          {formatDate(user.membershipExpiry)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                              daysLeft === 0
                                ? "text-red-700 bg-red-200/50"
                                : daysLeft <= 7
                                  ? "text-yellow-700 bg-yellow-200/50"
                                  : "text-green-700 bg-green-200/50"
                            }`}
                          >
                            {daysLeft} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                              status === "Active"
                                ? "bg-green-200/50 text-green-700"
                                : status === "Expired"
                                  ? "bg-red-200/50 text-red-700"
                                  : "bg-gray-200/50 text-slate-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/memberships/renew/${user._id}`)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-semibold transition-all duration-300"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => handleBlockUnblock(user._id, user.name)}
                            disabled={blockingUserId === user._id}
                            className={`${
                              user.isBlocked
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            } text-white px-4 py-2 rounded text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {blockingUserId === user._id
                              ? "..."
                              : user.isBlocked
                                ? "Unlock"
                                : "Block"}
                          </button>
                          </div>
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
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center">
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No Renewal Requests
              </h3>
              <p className="text-slate-500">
                There are no membership renewal requests at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-200/80 sticky top-0 z-10 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Current Expiry
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300/50">
                  {requests.map((request) => (
                    <tr
                      key={request._id}
                      className="bg-white hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {request.userName}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {request.email}
                      </td>
                      <td className="px-6 py-4">
                        {getPackageBadge(request.packageType)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(request.currentMembershipExpiry)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(request.requestDate)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-left">
                        {request.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(request._id)}
                              disabled={processingRequestId === request._id}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingRequestId === request._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              disabled={processingRequestId === request._id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-xs font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingRequestId === request._id ? "..." : "Reject"}
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
          )}

          {/* Request Stats */}
          {requests.length > 0 && (
            <div className="bg-white bg-opacity-50 border-t border-slate-200 p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-1">Total Requests</p>
                <p className="text-slate-900 text-2xl font-bold">{requests.length}</p>
              </div>
              <div className="text-center">
                <p className="text-yellow-300 text-sm mb-1">Pending</p>
                <p className="text-yellow-400 text-2xl font-bold">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-green-700 text-sm mb-1">Approved</p>
                <p className="text-green-700 text-2xl font-bold">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-red-700 text-sm mb-1">Rejected</p>
                <p className="text-red-700 text-2xl font-bold">
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
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1">Total Memberships</p>
            <p className="text-slate-900 text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1">Active</p>
            <p className="text-green-700 text-2xl font-bold">
              {
                users.filter(
                  (u) => getMembershipStatus(u.membershipExpiry) === "Active",
                ).length
              }
            </p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1">Expired</p>
            <p className="text-red-700 text-2xl font-bold">
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
            className="bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
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
  </div>
  );
};

export default MembershipManagement;



