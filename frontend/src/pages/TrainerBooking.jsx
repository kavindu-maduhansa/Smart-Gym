import React, { useState, useEffect } from "react";
import axios from "axios";
import apiClient from "../services/apiClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const TrainerBooking = () => {
  const [tab, setTab] = useState("trainer");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, booking: null });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [viewFeedbackModal, setViewFeedbackModal] = useState({ open: false, feedback: null });
  const [isEditing, setIsEditing] = useState(false);
  const [filterDate, setFilterDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterTrainer, setFilterTrainer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/student/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort bookings descending by date and time (newest first)
      const sortedBookings = res.data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
        const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
        return dateB - dateA;
      });
      setBookings(sortedBookings);

      // Fetch all student feedbacks in one go
      const fbRes = await axios.get(apiClient.feedback.getMySubmissions, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fbMap = {};
      fbRes.data.forEach(fb => {
        if (fb.sessionId) fbMap[fb.sessionId] = fb;
      });
      setFeedbackGiven(fbMap);
    } catch (err) {
      console.error("Error fetching bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (feedbackModal.open || viewFeedbackModal.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup on unmount
    return () => { document.body.style.overflow = "unset"; };
  }, [feedbackModal.open, viewFeedbackModal.open]);

  const openFeedback = (booking) => {
    setFeedbackForm({ rating: 0, comment: "" });
    setIsEditing(false);
    setFeedbackModal({ open: true, booking });
  };

  const openViewFeedback = (feedback) => {
    setViewFeedbackModal({ open: true, feedback });
  };

  const handleStartEdit = (feedback) => {
    setFeedbackForm({ rating: feedback.rating, comment: feedback.comment });
    setIsEditing(true);
    setViewFeedbackModal({ open: false, feedback: null });
    // Find the booking for this feedback to show in modal header
    const booking = bookings.find(b => b._id === feedback.sessionId);
    setFeedbackModal({ open: true, booking });
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(apiClient.feedback.delete(feedbackId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Feedback deleted successfully!");
      fetchMyBookings();
      setViewFeedbackModal({ open: false, feedback: null });
    } catch (err) {
      alert("Failed to delete feedback.");
    }
  };

  const submitFeedback = async () => {
    if (feedbackForm.rating === 0) {
      alert("Please select a rating.");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (isEditing) {
        // Find the feedback object for mapping
        const feedbackObj = feedbackGiven[feedbackModal.booking._id];
        await axios.put(apiClient.feedback.update(feedbackObj._id), {
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Feedback updated!");
      } else {
        await axios.post(apiClient.feedback.submit, {
          sessionId: feedbackModal.booking._id,
          trainerId: feedbackModal.booking.trainer?._id,
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Feedback submitted!");
      }
      fetchMyBookings();
      setFeedbackModal({ open: false, booking: null });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This will make the slot available for others.")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/student/cancel/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Booking cancelled successfully!");
      fetchMyBookings(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const sessionDateStr = b.date;
    const now = new Date();

    let matchesDate = true;
    if (filterDate) {
      matchesDate = sessionDateStr === format(filterDate, "yyyy-MM-dd");
    }

    const matchesTrainer = filterTrainer ? b.trainer?.name?.toLowerCase().includes(filterTrainer.toLowerCase()) : true;

    let matchesStatus = true;
    const isCompleted = b.date < format(now, "yyyy-MM-dd") || (b.date === format(now, "yyyy-MM-dd") && b.time <= format(now, "HH:mm"));

    if (statusFilter === "upcoming") {
      matchesStatus = !isCompleted;
    } else if (statusFilter === "attended") {
      matchesStatus = b.attendanceStatus === "Attended";
    } else if (statusFilter === "absent") {
      matchesStatus = b.attendanceStatus === "Absent";
    }

    return matchesDate && matchesTrainer && matchesStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterTrainer, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>

      <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-4xl font-bold text-orange mb-8 border-b border-orange/10 pb-6 text-center tracking-tight">
          My Booked Sessions
        </h2>

        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ${tab === "trainer" ? "bg-orange text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
            onClick={() => setTab("trainer")}
          >
            Trainer Booking
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ml-2 ${tab === "slot" ? "bg-orange text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
            onClick={() => setTab("slot")}
          >
            Slot Booking
          </button>
        </div>

        {tab === "trainer" && (
          <>
            <div className="flex flex-nowrap gap-4 mb-6 items-center bg-black/40 p-4 rounded-xl border border-white/10 whitespace-nowrap min-w-0 overflow-x-auto no-scrollbar">
              <span className="text-gray-500 font-semibold text-xs tracking-tight mr-2 shrink-0">Filter By:</span>

              <div className="relative flex-1 max-w-[180px]">
                <input
                  type="text"
                  placeholder="Trainer name..."
                  value={filterTrainer}
                  onChange={(e) => setFilterTrainer(e.target.value)}
                  className="bg-black/50 border border-white/10 p-2 rounded-lg text-white focus:outline-none focus:border-orange transition-all w-full text-xs font-medium placeholder:text-gray-600"
                />
              </div>

              <div className="w-px h-6 bg-white/10 mx-2"></div>

              <div className="relative">
                <DatePicker
                  selected={filterDate}
                  onChange={(date) => setFilterDate(date)}
                  className="bg-black/50 border border-white/10 p-2 rounded-lg text-white focus:outline-none focus:border-orange transition-all min-w-[140px] text-xs font-medium placeholder:text-gray-600"
                  placeholderText="Search Date"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  portalId="root-portal"
                />
              </div>

              <div className="w-px h-6 bg-white/10 mx-2"></div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/50 border border-white/10 p-2 rounded-lg text-white focus:outline-none focus:border-orange transition-all min-w-[130px] text-xs font-bold uppercase tracking-widest cursor-pointer appearance-none pr-8"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="attended">Attended</option>
                  <option value="absent">Absent</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
              </div>

              {(filterDate || statusFilter !== "all" || filterTrainer) && (
                <button
                  onClick={() => { setFilterDate(null); setStatusFilter("all"); setFilterTrainer(""); }}
                  className="bg-white/5 border border-white/10 text-gray-400 px-4 py-2 rounded-lg font-bold hover:bg-white/10 hover:text-white transition-all text-[10px] uppercase tracking-widest ml-auto"
                >
                  Clear All
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading your schedule...</p>
            ) : filteredBookings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {currentItems.map((b) => (
                    <div key={b._id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.2fr] gap-4 items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                      <div>
                        <h3 className="text-xl font-bold text-orange tracking-tight">{b.title}</h3>
                        <p className="text-gray-400 text-[13px] font-medium mt-1">Trainer: {b.trainer?.name}</p>
                      </div>
                    <div className="text-left md:text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                      <p className="text-white text-sm font-semibold tracking-tight">{b.date}</p>
                      <p className="text-orange text-sm font-bold mt-0.5">{b.time}</p>
                    </div>

                      <div className="flex flex-col items-end gap-2">
                        {(() => {
                          const sessionTime = new Date(`${b.date}T${b.time || "00:00"}`);
                          const now = new Date();
                          const isCompleted = sessionTime < now;
                          const isAttended = b.attendanceStatus === "Attended";
                          const isAbsent = b.attendanceStatus === "Absent";
                          const hasFeedback = feedbackGiven[b._id];

                          if (isCompleted) {
                            return (
                              <div className="flex flex-col items-end gap-2">
                                {isAttended ? (
                                  <span className="bg-green-500/5 text-green-400 px-3 py-1.5 rounded-lg text-xs tracking-wider font-semibold border border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
                                    Attended
                                  </span>
                                ) : isAbsent ? (
                                  <span className="bg-red-500/5 text-red-400 px-3 py-1.5 rounded-lg text-xs tracking-wider font-semibold border border-red-500/10">
                                    Absent
                                  </span>
                                ) : (
                                  <span className="bg-white/5 text-gray-400 px-3 py-1.5 rounded-lg text-xs tracking-wider font-semibold border border-white/10">
                                    Expired
                                  </span>
                                )}

                                {isAttended && (
                                  hasFeedback ? (
                                    <button
                                      className="bg-white/5 text-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-all text-xs tracking-wider border border-white/10"
                                      onClick={() => openViewFeedback(hasFeedback)}
                                    >
                                      View Feedback
                                    </button>
                                  ) : (
                                    <button
                                      className="bg-orange text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange/90 transition-all text-xs tracking-wider shadow-lg shadow-orange/20 active:scale-95"
                                      onClick={() => openFeedback(b)}
                                    >
                                      Give Feedback
                                    </button>
                                  )
                                )}
                              </div>
                            );
                          }

                          return (
                            <div className="flex flex-col items-end gap-2">
                              <span className="bg-blue-500/5 text-blue-400 px-3 py-1.5 rounded-lg text-xs tracking-wider font-semibold border border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                                Upcoming
                              </span>
                              <button
                                className="bg-red-500/5 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg font-semibold transition-all text-xs tracking-wider border border-red-500/20 active:scale-95"
                                onClick={() => handleCancelBooking(b._id)}
                              >
                                Cancel Booking
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-6 mt-10 pt-6 border-t border-white/10">
                    <button
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-orange/50 disabled:opacity-30 disabled:hover:border-white/10 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-2 group"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="group-hover:-translate-x-1 transition-transform">←</span> Prev
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-orange font-bold text-sm tracking-wider">{currentPage}</span>
                      <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-none">of</span>
                      <span className="text-white font-bold text-sm tracking-wider">{totalPages}</span>
                    </div>

                    <button
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-orange/50 disabled:opacity-30 disabled:hover:border-white/10 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-2 group"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 px-4 bg-black/40 rounded-xl border border-white/10">
                <p className="text-gray-500 italic">No trainer sessions found matching your criteria.</p>
              </div>
            )}
          </>
        )}

        {tab === "slot" && (
          <div className="text-center py-10">
            <p className="text-gray-500 italic">You haven't booked any slots yet.</p>
          </div>
        )}
      </div>

      {/* Give Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-orange/30 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                onClick={() => setFeedbackModal({ open: false, booking: null })}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-orange mb-2">{isEditing ? "Update Feedback" : "Session Feedback"}</h3>
              <p className="text-gray-400 text-sm mb-6 underline decoration-orange/30 offset-4 italic">
                {feedbackModal.booking?.title} with {feedbackModal.booking?.trainer?.name}
              </p>

              <div className="mb-6">
                <label className="block text-gray-300 mb-3 font-semibold uppercase text-xs tracking-widest">Your Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-4xl transition-all hover:scale-110 active:scale-95 ${feedbackForm.rating >= star ? "text-orange drop-shadow-[0_0_12px_rgba(255,127,17,0.6)]" : "text-gray-700"}`}
                      onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-gray-300 mb-3 font-semibold uppercase text-xs tracking-widest">
                  Comments <span className="text-gray-500 font-normal lowercase">(Optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl bg-black/50 border border-white/10 text-white p-4 focus:outline-none focus:border-orange/50 transition-all text-sm placeholder:italic"
                  rows={4}
                  value={feedbackForm.comment}
                  onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="What did you think of the session?"
                />
              </div>

              <button
                className="w-full bg-orange text-white font-bold py-3.5 rounded-xl hover:bg-orange/90 disabled:opacity-50 transition-all uppercase tracking-widest shadow-xl shadow-orange/20 active:scale-[0.98]"
                onClick={submitFeedback}
                disabled={submitting || feedbackForm.rating === 0}
              >
                {submitting ? "Processing..." : (isEditing ? "Update Feedback" : "Submit Feedback")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewFeedbackModal.open && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-green-500/30 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                onClick={() => setViewFeedbackModal({ open: false, feedback: null })}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-green-400 mb-6">Your Feedback</h3>

              <div className="mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                <label className="block text-gray-400 mb-2 font-semibold uppercase text-[10px] tracking-[0.2em]">Rating Given</label>
                <div className="flex gap-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <span
                      key={starValue}
                      className={`${viewFeedbackModal.feedback?.rating >= starValue ? "text-orange drop-shadow-[0_0_8px_rgba(255,127,17,0.4)]" : "text-gray-700"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                <label className="block text-gray-400 mb-2 font-semibold uppercase text-[10px] tracking-[0.2em]">Your Comments</label>
                <p className="text-gray-200 italic leading-relaxed">
                  "{viewFeedbackModal.feedback?.comment || "No comment provided."}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  className="bg-orange/10 text-orange border border-orange/30 font-bold py-3 rounded-xl hover:bg-orange/20 transition-all uppercase tracking-widest text-xs"
                  onClick={() => handleStartEdit(viewFeedbackModal.feedback)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500/10 text-red-500 border border-red-500/30 font-bold py-3 rounded-xl hover:bg-red-500/20 transition-all uppercase tracking-widest text-xs"
                  onClick={() => handleDeleteFeedback(viewFeedbackModal.feedback?._id)}
                >
                  Delete
                </button>
              </div>

              <button
                className="w-full mt-3 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                onClick={() => setViewFeedbackModal({ open: false, feedback: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerBooking;