import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import apiClient from "../services/apiClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const GYM_API = "http://localhost:5000/api/gym-schedules";

function readJwtPayload() {
  const t = localStorage.getItem("token");
  if (!t) return null;
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
}

function utcTodayYmd() {
  const t = new Date();
  const y = t.getUTCFullYear();
  const mo = String(t.getUTCMonth() + 1).padStart(2, "0");
  const d = String(t.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

function isPastScheduleDate(yyyyMmDd) {
  return yyyyMmDd < utcTodayYmd();
}

function minutesFromTime(hhmm) {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function getGymSlotLiveStatus(dateYmd, startTime, endTime) {
  const now = new Date();
  const todayYmd = format(now, "yyyy-MM-dd");
  if (dateYmd < todayYmd) return "FINISHED";
  if (dateYmd > todayYmd) return "UPCOMING";

  const nowM = now.getHours() * 60 + now.getMinutes();
  const startM = minutesFromTime(startTime);
  const endM = minutesFromTime(endTime);

  if (nowM >= endM) return "FINISHED";
  if (nowM >= startM) return "ONGOING";
  return "UPCOMING";
}

function minutesUntilSlotStartLocal(dateYmd, startTime) {
  try {
    const [y, M, d] = String(dateYmd).split("-").map(Number);
    const [h, m] = String(startTime || "0:0").split(":").map(Number);
    const slotStart = new Date(y, (M || 1) - 1, d || 1, h || 0, m || 0, 0, 0);
    return Math.floor((slotStart.getTime() - Date.now()) / 60000);
  } catch {
    return -999999;
  }
}

/** ONGOING → UPCOMING → FINISHED; FINISHED grouped at bottom. */
function sortGymSlotBookingsByLiveStatus(bookings) {
  const rank = (live) =>
    live === "ONGOING" ? 0 : live === "UPCOMING" ? 1 : live === "FINISHED" ? 2 : 3;
  return [...bookings].sort((a, b) => {
    const liveA = getGymSlotLiveStatus(a.date, a.startTime, a.endTime);
    const liveB = getGymSlotLiveStatus(b.date, b.startTime, b.endTime);
    const byRank = rank(liveA) - rank(liveB);
    if (byRank !== 0) return byRank;
    const tA = new Date(`${a.date}T${a.startTime || "00:00"}`).getTime();
    const tB = new Date(`${b.date}T${b.startTime || "00:00"}`).getTime();
    if (liveA === "FINISHED") return tB - tA;
    return tA - tB;
  });
}

function getUserId() {
  const fromLs = localStorage.getItem("userId");
  if (fromLs) return fromLs;
  const p = readJwtPayload();
  return p?.id ? String(p.id) : null;
}

const TrainerBooking = () => {
  const navigate = useNavigate();
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

  const [slotBookings, setSlotBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotFilterDate, setSlotFilterDate] = useState(null);
  const [editSlotModal, setEditSlotModal] = useState({ open: false, row: null });
  const [viewSlotModal, setViewSlotModal] = useState({ open: false, row: null });
  const [cancelledSlotNotifs, setCancelledSlotNotifs] = useState([]);
  const [moveTarget, setMoveTarget] = useState("");
  const [gymCatalog, setGymCatalog] = useState([]);
  const [slotActionKey, setSlotActionKey] = useState(null);
  const [gymBookingRules, setGymBookingRules] = useState(null);
  const [toastMsg, setToastMsg] = useState({ type: "", text: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const role = useMemo(() => {
    const p = readJwtPayload();
    return String(p?.role || "").toLowerCase();
  }, []);

  const dashboardPath = useMemo(() => {
    if (role === "admin") return "/admin-dashboard";
    if (role === "trainer") return "/trainer-dashboard";
    return "/student-dashboard";
  }, [role]);

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
    axios
      .get(`${GYM_API}/booking-rules`)
      .then((r) => setGymBookingRules(r.data))
      .catch(() => setGymBookingRules(null));
  }, []);

  const fetchSlotBookings = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${GYM_API}/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSlotBookings(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSlotBookings([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const fetchCancelledSlotBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${GYM_API}/my-notifications?includeRead=true&kinds=BOOKING_CANCELLED`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCancelledSlotNotifs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCancelledSlotNotifs([]);
    }
  }, []);

  useEffect(() => {
    if (tab !== "slot") return;
    fetchSlotBookings();
    fetchCancelledSlotBookings();
    const timer = window.setInterval(() => {
      fetchSlotBookings();
      fetchCancelledSlotBookings();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [tab, fetchSlotBookings, fetchCancelledSlotBookings]);

  const openEditSlot = async (row) => {
    setEditSlotModal({ open: true, row });
    setMoveTarget("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(GYM_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGymCatalog(Array.isArray(res.data) ? res.data : []);
    } catch {
      setGymCatalog([]);
    }
  };

  const buildMoveOptions = (catalog, currentScheduleId, currentSlotId) => {
    const uid = getUserId();
    const opts = [];
    for (const sched of catalog) {
      if (isPastScheduleDate(sched.date)) continue;
      for (const sl of sched.slots || []) {
        if (String(sched._id) === String(currentScheduleId) && String(sl._id) === String(currentSlotId)) {
          continue;
        }
        const booked = sl.bookedCount || 0;
        const cap = sl.capacity || 0;
        const taken = (sl.bookings || []).some((b) => String(b.user) === String(uid));
        if (booked >= cap || taken) continue;
        opts.push({
          scheduleId: sched._id,
          slotId: sl._id,
          label: `${sched.date} · ${sl.startTime}–${sl.endTime}${sched.dayLabel ? ` (${sched.dayLabel})` : ""}`,
        });
      }
    }
    return opts;
  };

  const submitMoveSlot = async () => {
    const row = editSlotModal.row;
    if (!row || !moveTarget) return;
    const [targetScheduleId, targetSlotId] = moveTarget.split("|");
    if (!targetScheduleId || !targetSlotId) return;
    setSlotActionKey(`move-${row.scheduleId}-${row.slotId}`);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${GYM_API}/${row.scheduleId}/slots/${row.slotId}/book`,
        { targetScheduleId, targetSlotId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditSlotModal({ open: false, row: null });
      setMoveTarget("");
      await fetchSlotBookings();
      setToastMsg({ type: "success", text: "Booking updated successfully." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
    } catch (e) {
      setToastMsg({ type: "error", text: e.response?.data?.message || "Could not update booking." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
    } finally {
      setSlotActionKey(null);
    }
  };

  const moveOptions = useMemo(() => {
    if (!editSlotModal.open || !editSlotModal.row) return [];
    return buildMoveOptions(
      gymCatalog,
      editSlotModal.row.scheduleId,
      editSlotModal.row.slotId,
    );
  }, [
    gymCatalog,
    editSlotModal.open,
    editSlotModal.row?.scheduleId,
    editSlotModal.row?.slotId,
  ]);

  const deleteSlotBooking = async (row) => {
    setSlotActionKey(`del-${row.scheduleId}-${row.slotId}`);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${GYM_API}/${row.scheduleId}/slots/${row.slotId}/book`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSlotBookings();
      setToastMsg({ type: "success", text: "Booking cancelled successfully." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
    } catch (e) {
      setToastMsg({ type: "error", text: e.response?.data?.message || "Could not cancel." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
    } finally {
      setSlotActionKey(null);
    }
  };

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
    try {
      const token = localStorage.getItem("token");
      await axios.delete(apiClient.feedback.delete(feedbackId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToastMsg({ type: "success", text: "Feedback deleted successfully!" });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
      fetchMyBookings();
      setViewFeedbackModal({ open: false, feedback: null });
    } catch (err) {
      setToastMsg({ type: "error", text: "Failed to delete feedback." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
    }
  };

  const submitFeedback = async () => {
    if (feedbackForm.rating === 0) {
      setToastMsg({ type: "error", text: "Please select a rating." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
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
        setToastMsg({ type: "success", text: "Feedback updated!" });
        setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
      } else {
        await axios.post(apiClient.feedback.submit, {
          sessionId: feedbackModal.booking._id,
          trainerId: feedbackModal.booking.trainer?._id,
          rating: feedbackForm.rating,
          comment: feedbackForm.comment,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToastMsg({ type: "success", text: "Feedback submitted!" });
        setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
      }
      fetchMyBookings();
      setFeedbackModal({ open: false, booking: null });
    } catch (err) {
      setToastMsg({ type: "error", text: err.response?.data?.message || "Failed to process feedback." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/student/cancel/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToastMsg({ type: "success", text: "Booking cancelled successfully!" });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
      fetchMyBookings(); // Refresh the list
    } catch (err) {
      setToastMsg({ type: "error", text: err.response?.data?.message || "Failed to cancel booking." });
      setTimeout(() => setToastMsg({ type: "", text: "" }), 3000);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10"></div>

      <div className="max-w-4xl mx-auto backdrop-blur-md bg-slate-50 border border-slate-200 rounded-2xl p-8">
        <h2 className="text-4xl font-bold text-blue-600 mb-8 border-b border-blue-600/10 pb-6 text-center tracking-tight">
          My Booked Sessions
        </h2>

        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ${tab === "trainer" ? "bg-blue-600 text-black" : "bg-white text-slate-900 hover:bg-slate-100"}`}
            onClick={() => setTab("trainer")}
          >
            Trainer Booking
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ml-2 ${tab === "slot" ? "bg-blue-600 text-black" : "bg-white text-slate-900 hover:bg-slate-100"}`}
            onClick={() => setTab("slot")}
          >
            Slot Booking
          </button>
        </div>

        {tab === "trainer" && (
          <>
            <div className="flex flex-nowrap gap-4 mb-6 items-center bg-blue-50/40 p-4 rounded-xl border border-slate-200 whitespace-nowrap min-w-0 overflow-x-auto no-scrollbar">
              <span className="text-slate-600 font-semibold text-xs tracking-tight mr-2 shrink-0">Filter By:</span>

              <div className="relative flex-1 max-w-[180px]">
                <input
                  type="text"
                  placeholder="Trainer name..."
                  value={filterTrainer}
                  onChange={(e) => setFilterTrainer(e.target.value)}
                  className="bg-blue-50/50 border border-slate-200 p-2 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 transition-all w-full text-xs font-medium placeholder:text-gray-600"
                />
              </div>

              <div className="w-px h-6 bg-slate-100 mx-2"></div>

              <div className="relative">
                <DatePicker
                  selected={filterDate}
                  onChange={(date) => setFilterDate(date)}
                  className="bg-blue-50/50 border border-slate-200 p-2 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 transition-all min-w-[140px] text-xs font-medium placeholder:text-gray-600"
                  placeholderText="Search Date"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  portalId="root-portal"
                />
              </div>

              <div className="w-px h-6 bg-slate-100 mx-2"></div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-blue-50/50 border border-slate-200 p-2 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 transition-all min-w-[130px] text-xs font-bold uppercase tracking-widest cursor-pointer appearance-none pr-8"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="attended">Attended</option>
                  <option value="absent">Absent</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
              </div>

              {(filterDate || statusFilter !== "all" || filterTrainer) && (
                <button
                  onClick={() => { setFilterDate(null); setStatusFilter("all"); setFilterTrainer(""); }}
                  className="bg-slate-50 border border-slate-200 text-slate-500 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 hover:text-slate-900 transition-all text-[10px] uppercase tracking-widest ml-auto"
                >
                  Clear All
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center text-slate-600 py-10">Loading your schedule...</p>
            ) : filteredBookings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {currentItems.map((b) => (
                    <div key={b._id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.2fr] gap-4 items-center p-6 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
                      <div>
                        <h3 className="text-xl font-bold text-blue-600 tracking-tight">{b.title}</h3>
                        <p className="text-slate-500 text-[13px] font-medium mt-1">Trainer: {b.trainer?.name}</p>
                      </div>
                    <div className="text-left md:text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                      <p className="text-slate-900 text-sm font-semibold tracking-tight">{b.date}</p>
                      <p className="text-blue-600 text-sm font-bold mt-0.5">{b.time}</p>
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
                                  <span className="bg-green-500/5 text-green-700 px-3 py-1.5 rounded-lg text-xs tracking-wider font-semibold border border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
                                    Attended
                                  </span>
                                ) : isAbsent ? (
                                  <span className="bg-red-500/5 text-red-700 px-3 py-1.5 rounded-lg text-xs tracking-wider font-semibold border border-red-500/10">
                                    Absent
                                  </span>
                                ) : (
                                  <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-xs tracking-wider font-semibold border border-slate-200">
                                    Expired
                                  </span>
                                )}

                                {isAttended && (
                                  hasFeedback ? (
                                    <button
                                      className="bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-all text-xs tracking-wider border border-slate-200"
                                      onClick={() => openViewFeedback(hasFeedback)}
                                    >
                                      View Feedback
                                    </button>
                                  ) : (
                                    <button
                                      className="bg-blue-600 text-slate-900 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700/90 transition-all text-xs tracking-wider shadow-lg shadow-blue-600/20 active:scale-95"
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
                                onClick={() => setDeleteConfirm({
                                  type: 'delete',
                                  title: 'Cancel Booking?',
                                  text: 'Are you sure you want to cancel this session? This will make it available to other students.',
                                  onConfirm: () => handleCancelBooking(b._id)
                                })}
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
                  <div className="flex justify-center items-center gap-6 mt-10 pt-6 border-t border-slate-200">
                    <button
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-blue-600/50 disabled:opacity-30 disabled:hover:border-slate-200 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-2 group"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="group-hover:-translate-x-1 transition-transform">←</span> Prev
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-blue-600 font-bold text-sm tracking-wider">{currentPage}</span>
                      <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-none">of</span>
                      <span className="text-slate-900 font-bold text-sm tracking-wider">{totalPages}</span>
                    </div>

                    <button
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-blue-600/50 disabled:opacity-30 disabled:hover:border-slate-200 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-2 group"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 px-4 bg-blue-50/40 rounded-xl border border-slate-200">
                <p className="text-slate-600 italic">No trainer sessions found matching your criteria.</p>
              </div>
            )}
          </>
        )}

        {tab === "slot" && (
          <>
            {gymBookingRules && (
              <ul className="text-sm text-slate-500 mb-6 space-y-2 border border-slate-200 rounded-lg p-4 bg-blue-50/30">
                <li>
                  <span className="text-blue-600 font-bold">No double booking:</span> one slot per time
                  window; overlapping bookings blocked.
                </li>
                <li>
                  <span className="text-blue-600 font-bold">Daily limit:</span>{" "}
                  {gymBookingRules.maxBookingsPerDay} gym slot(s) per day.
                </li>
                <li>
                  <span className="text-blue-600 font-bold">Slot gap:</span> more than 2 hours between
                  your same-day slots
                  {gymBookingRules.minGapMinutes ? ` (> ${gymBookingRules.minGapMinutes - 1} minutes)` : ""}.
                </li>
                <li>
                  <span className="text-blue-600 font-bold">Deadline:</span>{" "}
                  {gymBookingRules.deadlineHoursBeforeSlot > 0
                    ? `${gymBookingRules.deadlineHoursBeforeSlot} hour(s) before slot start`
                    : "none set"}
                  .
                </li>
              </ul>
            )}
            <div className="flex flex-wrap gap-4 mb-6 items-center bg-blue-50/40 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-sm tracking-wider">Filter:</span>
              <div className="relative">
                <DatePicker
                  selected={slotFilterDate}
                  onChange={(d) => setSlotFilterDate(d)}
                  className="bg-black border border-slate-300 p-2 rounded text-slate-900 focus:outline-none focus:border-blue-600 min-w-[150px]"
                  placeholderText="By date…"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                />
              </div>
              {slotFilterDate && (
                <button
                  type="button"
                  onClick={() => setSlotFilterDate(null)}
                  className="bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded font-bold hover:bg-slate-100 text-sm"
                >
                  Clear
                </button>
              )}
            </div>

            {loadingSlots ? (
              <p className="text-center text-slate-600 py-10">Loading gym slot bookings…</p>
            ) : (
              (() => {
                const filtered = sortGymSlotBookingsByLiveStatus(
                  slotBookings.filter((b) =>
                    slotFilterDate ? b.date === format(slotFilterDate, "yyyy-MM-dd") : true,
                  ),
                );
                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10 px-4 bg-blue-50/40 rounded-xl border border-slate-200">
                      <p className="text-slate-600 italic">
                        {slotBookings.length === 0
                          ? "You have not booked any gym slots yet."
                          : "No bookings match this date."}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {filtered.map((b) => {
                      const past = isPastScheduleDate(b.date);
                      const live = getGymSlotLiveStatus(b.date, b.startTime, b.endTime);
                      const changeDeadlineMin = Math.max(
                        0,
                        parseInt(gymBookingRules?.changeDeadlineMinutes || "60", 10) || 60,
                      );
                      const minsUntil = minutesUntilSlotStartLocal(b.date, b.startTime);
                      const canChange =
                        !past && live === "UPCOMING" && minsUntil >= changeDeadlineMin;
                      const actionBusy = slotActionKey === `del-${b.scheduleId}-${b.slotId}` ||
                        slotActionKey === `move-${b.scheduleId}-${b.slotId}`;
                      return (
                        <div
                          key={`${b.scheduleId}-${b.slotId}`}
                          className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 rounded-xl border transition-all ${
                            past
                              ? "bg-blue-50/20 border-white/5 opacity-70"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div>
                            <h3 className="text-xl font-bold text-blue-600">
                              {b.startTime} – {b.endTime}
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">
                              {b.date}
                              {b.dayLabel ? ` · ${b.dayLabel}` : ""}
                            </p>
                            <div className="mt-2">
                              {(() => {
                                const cls =
                                  live === "ONGOING"
                                    ? "bg-blue-600/20 text-blue-600"
                                    : live === "FINISHED"
                                      ? "bg-slate-100 text-slate-500"
                                      : "bg-green-500/15 text-green-700";
                                return (
                                  <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${cls}`}>
                                    {live}
                                  </span>
                                );
                              })()}
                            </div>
                            {!past && live === "UPCOMING" && minsUntil < changeDeadlineMin ? (
                              <p className="text-amber-300/90 text-xs mt-2">
                                Edit/Delete closes {changeDeadlineMin} minutes before start.
                              </p>
                            ) : null}
                            {b.bookedAt && (
                              <p className="text-slate-600 text-xs mt-1">
                                Booked {format(new Date(b.bookedAt), "yyyy-MM-dd HH:mm")}
                              </p>
                            )}
                            {past && (
                              <p className="text-slate-600 text-xs mt-2 uppercase tracking-wide">Past date</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setViewSlotModal({ open: true, row: b })}
                              className="bg-slate-100 border border-white/25 text-slate-900 font-bold px-4 py-2 rounded hover:bg-white/15"
                            >
                              View
                            </button>
                            {canChange && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionBusy}
                                  onClick={() => openEditSlot(b)}
                                  className="bg-blue-600/90 text-black font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={actionBusy}
                                  onClick={() => setDeleteConfirm({
                                    type: 'delete',
                                    title: 'Cancel Gym Slot?',
                                    text: 'Are you sure you want to release this gym slot booking?',
                                    onConfirm: () => deleteSlotBooking(b)
                                  })}
                                  className="bg-red-500/20 text-red-700 border border-red-500/40 font-bold px-4 py-2 rounded hover:bg-red-500/30 disabled:opacity-50"
                                >
                                  {slotActionKey === `del-${b.scheduleId}-${b.slotId}` ? "…" : "Delete"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}

            <div className="mt-8 bg-blue-50/40 rounded-xl border border-slate-200 p-6">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-blue-600">Cancelled bookings</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Recent gym slot cancellations.
                  </p>
                </div>
              </div>

              {cancelledSlotNotifs.length === 0 ? (
                <div className="text-slate-600 italic text-sm">No cancelled bookings yet.</div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {cancelledSlotNotifs.slice(0, 20).map((n) => (
                    <div
                      key={n._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-slate-200 bg-blue-50/30 px-4 py-3"
                    >
                      <div className="text-slate-800 font-semibold">{n.message}</div>
                      <div className="text-xs text-slate-600">
                        {n.createdAt ? format(new Date(n.createdAt), "yyyy-MM-dd HH:mm") : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {viewSlotModal.open && viewSlotModal.row && (
              <div className="fixed inset-0 bg-blue-50/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-8 w-full max-w-md border border-blue-600/30 shadow-2xl relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-slate-500 hover:text-blue-600 text-2xl font-bold"
                    onClick={() => setViewSlotModal({ open: false, row: null })}
                  >
                    ×
                  </button>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">Gym slot booking</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Time</span>
                      <span className="text-slate-900 font-semibold text-right">
                        {viewSlotModal.row.startTime} – {viewSlotModal.row.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Date</span>
                      <span className="text-slate-900 font-semibold text-right">{viewSlotModal.row.date}</span>
                    </div>
                    {viewSlotModal.row.dayLabel ? (
                      <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Label</span>
                        <span className="text-slate-900 font-semibold text-right">
                          {viewSlotModal.row.dayLabel}
                        </span>
                      </div>
                    ) : null}
                    {viewSlotModal.row.bookedAt ? (
                      <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Booked at</span>
                        <span className="text-slate-900 font-semibold text-right">
                          {format(new Date(viewSlotModal.row.bookedAt), "yyyy-MM-dd HH:mm")}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 pb-1">
                      <span className="text-slate-500">Status</span>
                      {(() => {
                        const st = getGymSlotLiveStatus(
                          viewSlotModal.row.date,
                          viewSlotModal.row.startTime,
                          viewSlotModal.row.endTime,
                        );
                        const cls =
                          st === "ONGOING"
                            ? "bg-blue-600/20 text-blue-600"
                            : st === "FINISHED"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-green-500/15 text-green-700";
                        return (
                          <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${cls}`}>
                            {st}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-6 w-full bg-slate-100 border border-slate-300 text-slate-900 font-bold py-2 rounded hover:bg-white/15"
                    onClick={() => setViewSlotModal({ open: false, row: null })}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {editSlotModal.open && editSlotModal.row && (
              <div className="fixed inset-0 bg-blue-50/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-8 w-full max-w-md border border-blue-600/30 shadow-2xl relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-slate-500 hover:text-blue-600 text-2xl font-bold"
                    onClick={() => {
                      setEditSlotModal({ open: false, row: null });
                      setMoveTarget("");
                    }}
                  >
                    ×
                  </button>
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">Move booking</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Pick another open slot (today or future). Your current booking is released when you
                    confirm.
                  </p>
                  <label className="block text-slate-900 text-sm font-semibold mb-2">New slot</label>
                  <select
                    className="w-full bg-black border border-slate-300 text-slate-900 rounded p-2 mb-2"
                    value={moveTarget}
                    onChange={(e) => setMoveTarget(e.target.value)}
                  >
                    <option value="">Select a slot…</option>
                    {moveOptions.map((o) => (
                      <option key={`${o.scheduleId}-${o.slotId}`} value={`${o.scheduleId}|${o.slotId}`}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {moveOptions.length === 0 && (
                    <p className="text-amber-400/90 text-sm mb-4">No other open slots right now.</p>
                  )}
                  <button
                    type="button"
                    disabled={!moveTarget || slotActionKey === `move-${editSlotModal.row.scheduleId}-${editSlotModal.row.slotId}`}
                    onClick={submitMoveSlot}
                    className="w-full bg-blue-600 text-black font-bold py-2 rounded hover:bg-blue-700/90 disabled:opacity-50"
                  >
                    {slotActionKey === `move-${editSlotModal.row.scheduleId}-${editSlotModal.row.slotId}`
                      ? "Saving…"
                      : "Save change"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-center">
          <button
            type="button"
            onClick={() => navigate(dashboardPath)}
            className="bg-slate-100 border border-slate-300 text-slate-900 font-bold px-6 py-2 rounded-lg hover:bg-white/15"
          >
            Back to dashboard
          </button>
        </div>
      </div>

      {/* Give Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-blue-50/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-blue-600/30 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 text-2xl font-bold transition-colors"
                onClick={() => setFeedbackModal({ open: false, booking: null })}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{isEditing ? "Update Feedback" : "Session Feedback"}</h3>
              <p className="text-slate-500 text-sm mb-6 underline decoration-orange/30 offset-4 italic">
                {feedbackModal.booking?.title} with {feedbackModal.booking?.trainer?.name}
              </p>

              <div className="mb-6">
                <label className="block text-slate-700 mb-3 font-semibold uppercase text-xs tracking-widest">Your Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-4xl transition-all hover:scale-110 active:scale-95 ${feedbackForm.rating >= star ? "text-blue-600 drop-shadow-[0_0_12px_rgba(255,127,17,0.6)]" : "text-gray-700"}`}
                      onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-slate-700 mb-3 font-semibold uppercase text-xs tracking-widest">
                  Comments <span className="text-slate-600 font-normal lowercase">(Optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl bg-blue-50/50 border border-slate-200 text-slate-900 p-4 focus:outline-none focus:border-blue-600/50 transition-all text-sm placeholder:italic"
                  rows={4}
                  value={feedbackForm.comment}
                  onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="What did you think of the session?"
                />
              </div>

              <button
                className="w-full bg-blue-600 text-slate-900 font-bold py-3.5 rounded-xl hover:bg-blue-700/90 disabled:opacity-50 transition-all uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-[0.98]"
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
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-blue-50/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-green-500/30 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 text-2xl font-bold transition-colors"
                onClick={() => setViewFeedbackModal({ open: false, feedback: null })}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-green-700 mb-6">Your Feedback</h3>

              <div className="mb-6 bg-blue-50/40 p-4 rounded-xl border border-white/5">
                <label className="block text-slate-500 mb-2 font-semibold uppercase text-[10px] tracking-[0.2em]">Rating Given</label>
                <div className="flex gap-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <span
                      key={starValue}
                      className={`${viewFeedbackModal.feedback?.rating >= starValue ? "text-blue-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" : "text-gray-700"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6 bg-blue-50/40 p-4 rounded-xl border border-white/5">
                <label className="block text-slate-500 mb-2 font-semibold uppercase text-[10px] tracking-[0.2em]">Your Comments</label>
                <p className="text-slate-800 italic leading-relaxed">
                  "{viewFeedbackModal.feedback?.comment || "No comment provided."}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  className="bg-blue-600/10 text-blue-600 border border-blue-600/30 font-bold py-3 rounded-xl hover:bg-blue-700/20 transition-all uppercase tracking-widest text-xs"
                  onClick={() => handleStartEdit(viewFeedbackModal.feedback)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500/10 text-red-500 border border-red-500/30 font-bold py-3 rounded-xl hover:bg-red-500/20 transition-all uppercase tracking-widest text-xs"
                  onClick={() => setDeleteConfirm({
                    type: 'delete',
                    title: 'Delete Feedback?',
                    text: 'This action cannot be undone. Your rating and comments will be permanently removed.',
                    onConfirm: () => handleDeleteFeedback(viewFeedbackModal.feedback?._id)
                  })}
                >
                  Delete
                </button>
              </div>

              <button
                className="w-full mt-3 bg-slate-50 border border-slate-200 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                onClick={() => setViewFeedbackModal({ open: false, feedback: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Premium Toast Notification */}
      {toastMsg.text && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-top-8 duration-300">
          <div className={`px-8 py-4 rounded-full shadow-2xl font-black tracking-widest uppercase text-xs flex items-center gap-3 backdrop-blur-md ${
            toastMsg.type === "success" 
              ? "bg-green-500 text-slate-900 border border-green-400/50" 
              : "bg-red-500 text-white border border-red-400/50"
          }`}>
            {toastMsg.text}
          </div>
        </div>
      )}

      {/* Premium Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-10 text-center animate-in zoom-in-95 duration-300 shadow-2xl shadow-blue-600/10">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner ${deleteConfirm.type === 'delete' ? 'bg-red-50' : 'bg-blue-50'}`}>
              {deleteConfirm.type === 'delete' ? (
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{deleteConfirm.title}</h3>
            <p className="text-slate-500 mb-10 text-sm leading-relaxed">{deleteConfirm.text}</p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest border border-slate-200"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(null);
                }}
                className={`flex-1 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest shadow-xl text-white ${deleteConfirm.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerBooking;



