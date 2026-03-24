import React, { useState, useEffect } from "react";
import axios from "axios";
import apiClient from "../services/apiClient";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, booking: null });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/student/my-bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
      // Fetch feedbacks for these bookings
      for (const b of res.data) {
        try {
          const fbRes = await axios.get(apiClient.feedback.getForTrainer(b.trainer?._id), {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (fbRes.data.some(fb => fb.sessionId === b._id && fb.studentId?._id === b.bookedBy)) {
            setFeedbackGiven(fg => ({ ...fg, [b._id]: true }));
          }
        } catch {}
      }
    } catch (err) {
      console.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
    // eslint-disable-next-line
  }, []);

  const openFeedback = (booking) => {
    setFeedbackForm({ rating: 5, comment: "" });
    setFeedbackModal({ open: true, booking });
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(apiClient.feedback.submit, {
        sessionId: feedbackModal.booking._id,
        trainerId: feedbackModal.booking.trainer?._id,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackGiven(fg => ({ ...fg, [feedbackModal.booking._id]: true }));
      setFeedbackModal({ open: false, booking: null });
      alert("Feedback submitted!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-orange uppercase tracking-widest mb-8 border-b border-orange/20 pb-4">
          My Booked Sessions
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading your schedule...</p>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <div>
                  <h3 className="text-xl font-bold text-orange">{b.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">With {b.trainer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{b.date}</p>
                  <p className="text-orange text-sm">{b.time}</p>
                  {!feedbackGiven[b._id] ? (
                    <button
                      className="mt-2 bg-orange text-white px-4 py-2 rounded font-bold hover:bg-orange/90"
                      onClick={() => openFeedback(b)}
                    >
                      Give Feedback
                    </button>
                  ) : (
                    <span className="mt-2 inline-block text-green-400 font-bold">Feedback Given</span>
                  )}
                </div>
              </div>
            ))}
                {/* Feedback Modal */}
                {feedbackModal.open && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-orange/30 shadow-2xl relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-orange text-2xl font-bold"
                        onClick={() => setFeedbackModal({ open: false, booking: null })}
                      >
                        ×
                      </button>
                      <h3 className="text-2xl font-bold text-orange mb-4">Session Feedback</h3>
                      <div className="mb-4">
                        <label className="block text-white mb-2 font-semibold">Rating:</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`text-2xl ${feedbackForm.rating >= star ? "text-yellow-400" : "text-gray-600"}`}
                              onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-white mb-2 font-semibold">Comment:</label>
                        <textarea
                          className="w-full rounded bg-black border border-white/20 text-white p-2"
                          rows={3}
                          value={feedbackForm.comment}
                          onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
                          placeholder="Share your experience..."
                        />
                      </div>
                      <button
                        className="w-full bg-orange text-white font-bold py-2 rounded hover:bg-orange/90 disabled:opacity-60"
                        onClick={submitFeedback}
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                      </button>
                    </div>
                  </div>
                )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 italic">You haven't booked any sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;