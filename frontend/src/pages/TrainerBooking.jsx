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
  const [viewTrainerModal, setViewTrainerModal] = useState({ open: false, booking: null });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [filterDate, setFilterDate] = useState(null);
  const [filterTrainer, setFilterTrainer] = useState("");

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
      // Fetch feedbacks for these bookings
      for (const b of res.data) {
        try {
          const fbRes = await axios.get(apiClient.feedback.getForTrainer(b.trainer?._id), {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (fbRes.data.some(fb => fb.sessionId === b._id && fb.studentId?._id === b.bookedBy)) {
            setFeedbackGiven(fg => ({ ...fg, [b._id]: true }));
          }
        } catch { }
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
      alert("Booking updated.");
    } catch (e) {
      alert(e.response?.data?.message || "Could not update booking.");
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
    if (!window.confirm("Cancel this gym slot booking?")) return;
    setSlotActionKey(`del-${row.scheduleId}-${row.slotId}`);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${GYM_API}/${row.scheduleId}/slots/${row.slotId}/book`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSlotBookings();
      alert("Booking cancelled.");
    } catch (e) {
      alert(e.response?.data?.message || "Could not cancel.");
    } finally {
      setSlotActionKey(null);
    }
  };

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

  const filteredBookings = bookings.filter(b => {
    const matchesDate = filterDate ? b.date === format(filterDate, "yyyy-MM-dd") : true;
    const matchesTrainer = filterTrainer ? b.trainer?.name?.toLowerCase().includes(filterTrainer.toLowerCase()) : true;
    return matchesDate && matchesTrainer;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>

      <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-orange uppercase tracking-widest mb-8 border-b border-orange/20 pb-4 text-center">
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
            <div className="flex flex-wrap gap-4 mb-6 items-center bg-black/40 p-4 rounded-xl border border-white/10">
              <span className="text-gray-400 font-bold uppercase text-sm tracking-wider">Filter By:</span>
              <input
                type="text"
                placeholder="Trainer name..."
                value={filterTrainer}
                onChange={(e) => setFilterTrainer(e.target.value)}
                className="bg-black border border-white/20 p-2 rounded text-white focus:outline-none focus:border-orange transition-colors min-w-[150px]"
              />
              <div className="relative">
                <DatePicker
                  selected={filterDate}
                  onChange={(date) => setFilterDate(date)}
                  className="bg-black border border-white/20 p-2 rounded text-white focus:outline-none focus:border-orange transition-colors min-w-[150px]"
                  placeholderText="Select date..."
                  dateFormat="yyyy-MM-dd"
                  isClearable
                />
              </div>
              {(filterDate || filterTrainer) && (
                <button
                  onClick={() => { setFilterDate(null); setFilterTrainer(""); }}
                  className="bg-white/5 border border-white/20 text-gray-300 px-4 py-2 rounded font-bold hover:bg-white/10 hover:text-white transition-all text-sm uppercase tracking-widest ml-auto"
                >
                  Clear
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading your schedule...</p>
            ) : filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((b) => (
                  <div
                    key={b._id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-orange">{b.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">With {b.trainer?.name || "—"}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-3">
                      <div className="text-left sm:text-right">
                        <p className="font-bold">{b.date}</p>
                        <p className="text-orange text-sm">{b.time}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="bg-white/10 border border-white/25 text-white px-4 py-2 rounded font-bold hover:bg-white/15"
                          onClick={() => setViewTrainerModal({ open: true, booking: b })}
                        >
                          View
                        </button>
                        {!feedbackGiven[b._id] ? (
                          <button
                            type="button"
                            className="bg-orange text-white px-4 py-2 rounded font-bold hover:bg-orange/90"
                            onClick={() => openFeedback(b)}
                          >
                            Give Feedback
                          </button>
                        ) : (
                          <span className="inline-flex items-center text-green-400 font-bold text-sm">
                            Feedback Given
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {viewTrainerModal.open && viewTrainerModal.booking && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-orange/30 shadow-2xl relative">
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-gray-400 hover:text-orange text-2xl font-bold"
                        onClick={() => setViewTrainerModal({ open: false, booking: null })}
                      >
                        ×
                      </button>
                      <h3 className="text-2xl font-bold text-orange mb-4">Trainer session</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                          <span className="text-gray-400">Session</span>
                          <span className="text-white font-semibold text-right">
                            {viewTrainerModal.booking.title}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                          <span className="text-gray-400">Trainer</span>
                          <span className="text-white font-semibold text-right">
                            {viewTrainerModal.booking.trainer?.name || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                          <span className="text-gray-400">Date</span>
                          <span className="text-white font-semibold text-right">
                            {viewTrainerModal.booking.date}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                          <span className="text-gray-400">Time</span>
                          <span className="text-white font-semibold text-right">
                            {viewTrainerModal.booking.time}
                          </span>
                        </div>
                        {viewTrainerModal.booking.attendanceStatus ? (
                          <div className="flex justify-between gap-4 pb-1">
                            <span className="text-gray-400">Attendance</span>
                            <span className="text-white font-semibold">
                              {viewTrainerModal.booking.attendanceStatus}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="mt-6 w-full bg-white/10 border border-white/20 text-white font-bold py-2 rounded hover:bg-white/15"
                        onClick={() => setViewTrainerModal({ open: false, booking: null })}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

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
                          {[1, 2, 3, 4, 5].map((star) => (
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
              <div className="text-center py-10 px-4 bg-black/40 rounded-xl border border-white/10">
                <p className="text-gray-500 italic">No trainer sessions found matching your criteria.</p>
              </div>
            )}
          </>
        )}

        {tab === "slot" && (
          <>
            {gymBookingRules && (
              <ul className="text-sm text-gray-400 mb-6 space-y-2 border border-white/10 rounded-lg p-4 bg-black/30">
                <li>
                  <span className="text-orange font-bold">No double booking:</span> one slot per time
                  window; overlapping bookings blocked.
                </li>
                <li>
                  <span className="text-orange font-bold">Daily limit:</span>{" "}
                  {gymBookingRules.maxBookingsPerDay} gym slot(s) per day.
                </li>
                <li>
                  <span className="text-orange font-bold">Slot gap:</span> more than 2 hours between
                  your same-day slots
                  {gymBookingRules.minGapMinutes ? ` (> ${gymBookingRules.minGapMinutes - 1} minutes)` : ""}.
                </li>
                <li>
                  <span className="text-orange font-bold">Deadline:</span>{" "}
                  {gymBookingRules.deadlineHoursBeforeSlot > 0
                    ? `${gymBookingRules.deadlineHoursBeforeSlot} hour(s) before slot start`
                    : "none set"}
                  .
                </li>
              </ul>
            )}
            <div className="flex flex-wrap gap-4 mb-6 items-center bg-black/40 p-4 rounded-xl border border-white/10">
              <span className="text-gray-400 font-bold uppercase text-sm tracking-wider">Filter:</span>
              <div className="relative">
                <DatePicker
                  selected={slotFilterDate}
                  onChange={(d) => setSlotFilterDate(d)}
                  className="bg-black border border-white/20 p-2 rounded text-white focus:outline-none focus:border-orange min-w-[150px]"
                  placeholderText="By date…"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                />
              </div>
              {slotFilterDate && (
                <button
                  type="button"
                  onClick={() => setSlotFilterDate(null)}
                  className="bg-white/5 border border-white/20 text-gray-300 px-4 py-2 rounded font-bold hover:bg-white/10 text-sm"
                >
                  Clear
                </button>
              )}
            </div>

            {loadingSlots ? (
              <p className="text-center text-gray-500 py-10">Loading gym slot bookings…</p>
            ) : (
              (() => {
                const filtered = slotBookings.filter((b) =>
                  slotFilterDate ? b.date === format(slotFilterDate, "yyyy-MM-dd") : true,
                );
                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10 px-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-gray-500 italic">
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
                              ? "bg-black/20 border-white/5 opacity-70"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div>
                            <h3 className="text-xl font-bold text-orange">
                              {b.startTime} – {b.endTime}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                              {b.date}
                              {b.dayLabel ? ` · ${b.dayLabel}` : ""}
                            </p>
                            <div className="mt-2">
                              {(() => {
                                const cls =
                                  live === "ONGOING"
                                    ? "bg-orange/20 text-orange"
                                    : live === "FINISHED"
                                      ? "bg-white/10 text-gray-400"
                                      : "bg-green-500/15 text-green-400";
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
                              <p className="text-gray-500 text-xs mt-1">
                                Booked {format(new Date(b.bookedAt), "yyyy-MM-dd HH:mm")}
                              </p>
                            )}
                            {past && (
                              <p className="text-gray-500 text-xs mt-2 uppercase tracking-wide">Past date</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setViewSlotModal({ open: true, row: b })}
                              className="bg-white/10 border border-white/25 text-white font-bold px-4 py-2 rounded hover:bg-white/15"
                            >
                              View
                            </button>
                            {canChange && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionBusy}
                                  onClick={() => openEditSlot(b)}
                                  className="bg-orange/90 text-black font-bold px-4 py-2 rounded hover:bg-orange disabled:opacity-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={actionBusy}
                                  onClick={() => deleteSlotBooking(b)}
                                  className="bg-red-500/20 text-red-300 border border-red-500/40 font-bold px-4 py-2 rounded hover:bg-red-500/30 disabled:opacity-50"
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

            <div className="mt-8 bg-black/40 rounded-xl border border-white/10 p-6">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-orange">Cancelled bookings</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Recent gym slot cancellations.
                  </p>
                </div>
              </div>

              {cancelledSlotNotifs.length === 0 ? (
                <div className="text-gray-500 italic text-sm">No cancelled bookings yet.</div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {cancelledSlotNotifs.slice(0, 20).map((n) => (
                    <div
                      key={n._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <div className="text-gray-200 font-semibold">{n.message}</div>
                      <div className="text-xs text-gray-500">
                        {n.createdAt ? format(new Date(n.createdAt), "yyyy-MM-dd HH:mm") : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {viewSlotModal.open && viewSlotModal.row && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-orange/30 shadow-2xl relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-orange text-2xl font-bold"
                    onClick={() => setViewSlotModal({ open: false, row: null })}
                  >
                    ×
                  </button>
                  <h3 className="text-2xl font-bold text-orange mb-4">Gym slot booking</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                      <span className="text-gray-400">Time</span>
                      <span className="text-white font-semibold text-right">
                        {viewSlotModal.row.startTime} – {viewSlotModal.row.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                      <span className="text-gray-400">Date</span>
                      <span className="text-white font-semibold text-right">{viewSlotModal.row.date}</span>
                    </div>
                    {viewSlotModal.row.dayLabel ? (
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                        <span className="text-gray-400">Label</span>
                        <span className="text-white font-semibold text-right">
                          {viewSlotModal.row.dayLabel}
                        </span>
                      </div>
                    ) : null}
                    {viewSlotModal.row.bookedAt ? (
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                        <span className="text-gray-400">Booked at</span>
                        <span className="text-white font-semibold text-right">
                          {format(new Date(viewSlotModal.row.bookedAt), "yyyy-MM-dd HH:mm")}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 pb-1">
                      <span className="text-gray-400">Status</span>
                      {(() => {
                        const st = getGymSlotLiveStatus(
                          viewSlotModal.row.date,
                          viewSlotModal.row.startTime,
                          viewSlotModal.row.endTime,
                        );
                        const cls =
                          st === "ONGOING"
                            ? "bg-orange/20 text-orange"
                            : st === "FINISHED"
                              ? "bg-white/10 text-gray-400"
                              : "bg-green-500/15 text-green-400";
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
                    className="mt-6 w-full bg-white/10 border border-white/20 text-white font-bold py-2 rounded hover:bg-white/15"
                    onClick={() => setViewSlotModal({ open: false, row: null })}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {editSlotModal.open && editSlotModal.row && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-orange/30 shadow-2xl relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-orange text-2xl font-bold"
                    onClick={() => {
                      setEditSlotModal({ open: false, row: null });
                      setMoveTarget("");
                    }}
                  >
                    ×
                  </button>
                  <h3 className="text-2xl font-bold text-orange mb-2">Move booking</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Pick another open slot (today or future). Your current booking is released when you
                    confirm.
                  </p>
                  <label className="block text-white text-sm font-semibold mb-2">New slot</label>
                  <select
                    className="w-full bg-black border border-white/20 text-white rounded p-2 mb-2"
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
                    className="w-full bg-orange text-black font-bold py-2 rounded hover:bg-orange/90 disabled:opacity-50"
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

        <div className="mt-10 pt-6 border-t border-white/10 flex justify-center">
          <button
            type="button"
            onClick={() => navigate(dashboardPath)}
            className="bg-white/10 border border-white/20 text-white font-bold px-6 py-2 rounded-lg hover:bg-white/15"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerBooking;