import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

const AdminContactMessageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageData, setMessageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState("");

  const fetchMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiClient.contact.getById(id), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch message details");
      }

      setMessageData(data.data);
      setReplyText(data.data.adminReply || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

  useEffect(() => {
    const markSeenIfNew = async () => {
      const token = localStorage.getItem("token");
      if (!token || !messageData) return;
      if (messageData.status !== "new") return;

      try {
        await fetch(apiClient.contact.update(id), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "seen" }),
        });
        setMessageData((prev) => (prev ? { ...prev, status: "seen" } : prev));
      } catch {
        // no-op, keep page usable even if auto-status update fails
      }
    };

    markSeenIfNew();
  }, [id, messageData]);

  const handleSaveReply = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!replyText.trim()) {
      setReplyFeedback("Reply cannot be empty.");
      return;
    }

    setSavingReply(true);
    setReplyFeedback("");
    try {
      const response = await fetch(apiClient.contact.reply(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminReply: replyText }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save reply");
      }

      setMessageData(data.data);
      setReplyFeedback("Reply saved.");
    } catch (err) {
      setReplyFeedback(err.message);
    } finally {
      setSavingReply(false);
    }
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl p-6 sm:p-8 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Message Details</h1>
            <p className="text-slate-700">Full view of a Contact Us submission.</p>
          </div>

          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-8">
            {loading ? (
              <p className="text-slate-700">Loading message...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : !messageData ? (
              <p className="text-slate-700">Message not found.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Subject</p>
                  <h2 className="text-2xl font-bold">{messageData.subject}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-300 rounded-xl p-4 bg-blue-50/30">
                    <p className="text-slate-500 text-sm mb-1">Name</p>
                    <p className="text-slate-900">{messageData.name}</p>
                  </div>
                  <div className="border border-slate-300 rounded-xl p-4 bg-blue-50/30">
                    <p className="text-slate-500 text-sm mb-1">Email</p>
                    <p className="text-slate-900">{messageData.email}</p>
                  </div>
                  <div className="border border-slate-300 rounded-xl p-4 bg-blue-50/30">
                    <p className="text-slate-500 text-sm mb-1">Status</p>
                    <p className="text-slate-900">{messageData.status}</p>
                  </div>
                  <div className="border border-slate-300 rounded-xl p-4 bg-blue-50/30">
                    <p className="text-slate-500 text-sm mb-1">Submitted At</p>
                    <p className="text-slate-900">
                      {new Date(messageData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="border border-slate-300 rounded-xl p-5 bg-blue-50/30">
                  <p className="text-slate-500 text-sm mb-2">Message</p>
                  <p className="text-slate-800 whitespace-pre-wrap">{messageData.message}</p>
                </div>
                <div className="border border-slate-300 rounded-xl p-5 bg-blue-50/30">
                  <p className="text-slate-500 text-sm mb-2">Admin Reply</p>
                  <textarea
                    rows="4"
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Write your reply to this message..."
                    className="w-full px-4 py-3 rounded-lg bg-blue-50/40 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none text-sm"
                  ></textarea>
                  {replyFeedback && (
                    <p className="text-sm text-slate-700 mt-2">{replyFeedback}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      type="button"
                      onClick={handleSaveReply}
                      disabled={savingReply}
                      className="bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm disabled:opacity-60"
                    >
                      {savingReply ? "Saving..." : "Save Reply"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/admin/contact-messages")}
                  className="bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                >
                  Back to Admin Messages
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactMessageView;



