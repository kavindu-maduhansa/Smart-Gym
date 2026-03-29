import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

const normalizeStatus = (status) => {
  if (status === "in_progress") return "seen";
  if (status === "resolved") return "replied";
  return status;
};

const AdminContactMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [runningBulk, setRunningBulk] = useState(false);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiClient.contact.getAll, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }
      setMessages(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 15000);
    return () => clearInterval(intervalId);
  }, [autoRefresh]);

  const handleStatusUpdate = async (id, status) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(apiClient.contact.update(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update message");
      }
      await fetchMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(apiClient.contact.delete(id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete message");
      }
      await fetchMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  const runBulkStatusUpdate = async (fromStatus, toStatus) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const targets = messages.filter((item) => normalizeStatus(item.status) === fromStatus);
    if (targets.length === 0) return;

    setRunningBulk(true);
    setError("");
    try {
      await Promise.all(
        targets.map((item) =>
          fetch(apiClient.contact.update(item._id), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: toStatus }),
          }),
        ),
      );
      await fetchMessages();
    } catch {
      setError("Bulk update failed. Please try again.");
    } finally {
      setRunningBulk(false);
    }
  };

  const stats = useMemo(() => {
    const total = messages.length;
    const newCount = messages.filter((item) => normalizeStatus(item.status) === "new").length;
    const seenCount = messages.filter((item) => normalizeStatus(item.status) === "seen").length;
    const repliedCount = messages.filter(
      (item) => normalizeStatus(item.status) === "replied",
    ).length;
    return { total, newCount, seenCount, repliedCount };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let filtered = [...messages];
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => normalizeStatus(item.status) === statusFilter);
    }

    if (normalizedSearch) {
      filtered = filtered.filter((item) => {
        const haystack =
          `${item.subject} ${item.name} ${item.email} ${item.message}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "status") {
        return normalizeStatus(a.status).localeCompare(normalizeStatus(b.status));
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return filtered;
  }, [messages, searchTerm, sortBy, statusFilter]);

  const getSlaBadge = (createdAt, status) => {
    if (normalizeStatus(status) === "replied") return null;
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (ageHours >= 24) return "Over 24h";
    if (ageHours >= 12) return "Needs attention";
    return null;
  };

  const statusPillClass = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "new") return "bg-blue-600/20 text-blue-600 border border-blue-600/40";
    if (normalized === "seen") return "bg-blue-500/20 text-blue-700 border border-blue-400/50";
    return "bg-green-500/20 text-green-700 border border-green-400/50";
  };

  const handleView = async (item) => {
    if (normalizeStatus(item.status) === "new") {
      await handleStatusUpdate(item._id, "seen");
    }
    navigate(`/admin/contact-messages/${item._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl p-6 sm:p-8 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admin Messages</h1>
            <p className="text-slate-700">
              Track, prioritize, and manage messages from the Contact Us page.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-4">
              <p className="text-xs sm:text-sm text-slate-500">Total Messages</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-4">
              <p className="text-xs sm:text-sm text-slate-500">New</p>
              <p className="text-2xl font-bold text-blue-600">{stats.newCount}</p>
            </div>
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-4">
              <p className="text-xs sm:text-sm text-slate-500">Seen</p>
              <p className="text-2xl font-bold text-blue-600">{stats.seenCount}</p>
            </div>
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-4">
              <p className="text-xs sm:text-sm text-slate-500">Replied</p>
              <p className="text-2xl font-bold text-blue-600">{stats.repliedCount}</p>
            </div>
          </div>

          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search by subject, name, email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="lg:col-span-2 w-full px-4 py-2.5 rounded-lg bg-blue-50/40 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-50/40 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="new">new</option>
                <option value="seen">seen</option>
                <option value="replied">replied</option>
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-50/40 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
              >
                <option value="newest">Sort: newest first</option>
                <option value="oldest">Sort: oldest first</option>
                <option value="status">Sort: status</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => runBulkStatusUpdate("new", "seen")}
                disabled={runningBulk}
                className="bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm disabled:opacity-60"
              >
                Mark all new as seen
              </button>
              <button
                type="button"
                onClick={() => runBulkStatusUpdate("seen", "replied")}
                disabled={runningBulk}
                className="border border-white/30 text-slate-900 font-bold px-4 sm:px-6 py-2 rounded-lg hover:bg-slate-100 transition-all duration-300 text-xs sm:text-sm disabled:opacity-60"
              >
                Mark all seen as replied
              </button>
              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className={`font-bold px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm ${
                  autoRefresh
                    ? "bg-green-500/20 border border-green-400 text-green-700"
                    : "border border-white/30 text-slate-900 hover:bg-slate-100"
                }`}
              >
                Auto-refresh: {autoRefresh ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}
            {loading ? (
              <p className="text-slate-700">Loading messages...</p>
            ) : filteredMessages.length === 0 ? (
              <p className="text-slate-700">No contact messages yet.</p>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((item) => (
                  <div
                    key={item._id}
                    className="border border-slate-300 rounded-xl p-5 bg-blue-50/30"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold">{item.subject}</h3>
                        <p className="text-slate-700 text-sm">
                          {item.name} | {item.email}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                        {getSlaBadge(item.createdAt, item.status) && (
                          <p className="text-xs mt-2 text-blue-600">
                            {getSlaBadge(item.createdAt, item.status)}
                          </p>
                        )}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusPillClass(
                          item.status,
                        )}`}
                      >
                        {normalizeStatus(item.status)}
                      </div>
                    </div>
                    <p className="text-slate-800 mb-4">{item.message}</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        className="bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                      >
                        View
                      </button>
                      {normalizeStatus(item.status) === "new" && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(item._id, "seen")}
                          className="border border-blue-400 text-blue-700 font-bold px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-500/10 transition-all duration-300 text-xs sm:text-sm"
                        >
                          Mark Seen
                        </button>
                      )}
                      {normalizeStatus(item.status) === "seen" && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(item._id, "replied")}
                          className="border border-green-400 text-green-700 font-bold px-4 sm:px-6 py-2 rounded-lg hover:bg-green-500/10 transition-all duration-300 text-xs sm:text-sm"
                        >
                          Mark Replied
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="border border-red-400 text-red-700 font-bold px-4 sm:px-6 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactMessages;



