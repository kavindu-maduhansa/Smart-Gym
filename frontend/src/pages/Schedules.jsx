import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

function readJwtPayload() {
  const t = localStorage.getItem("token");
  if (!t) return null;
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
}

const TrainerAvailability = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/student";

  useEffect(() => {
    const fetchAvailableSchedules = async () => {
      const token = localStorage.getItem("token");
      console.log("[DEBUG] JWT token in localStorage:", token);
      try {
        const res = await axios.get(`${API_URL}/available`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load schedules. Please try again.");
        setLoading(false);
      }
    };
    fetchAvailableSchedules();
  }, []);

  const jwt = typeof localStorage !== "undefined" ? readJwtPayload() : null;
  const isStudent =
    (typeof localStorage !== "undefined" && localStorage.getItem("role") === "student") ||
    jwt?.role === "student";


  const [bookingId, setBookingId] = useState(null);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterTrainer, setFilterTrainer] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [trainerMsg, setTrainerMsg] = useState({ type: "", text: "" });
  const [statusFilter, setStatusFilter] = useState("all");

  const handleBook = async (id) => {
    setTrainerMsg({ type: "", text: "" });
    setBookingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/book/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainerMsg({ type: "success", text: "Session booked successfully." });
      // Refresh the list so the booked session disappears
      const res = await axios.get(`${API_URL}/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch (err) {
      setTrainerMsg({ type: "error", text: err.response?.data?.message || "Booking failed." });
    } finally {
      setBookingId(null);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesTitle = s.title?.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesTrainer = s.trainer?.name?.toLowerCase().includes(filterTrainer.toLowerCase());
    const matchesDate = filterDate ? s.date === format(filterDate, "yyyy-MM-dd") : true;

    // Combine date and time to check if session is expired
    const sessionDateTime = new Date(`${s.date}T${s.time || "00:00"}`);
    const now = new Date();
    const isExpired = sessionDateTime < now;

    let matchesStatus = true;
    if (statusFilter === "available") {
      matchesStatus = !isExpired;
    } else if (statusFilter === "closed") {
      matchesStatus = isExpired;
    }

    return matchesTitle && matchesTrainer && matchesDate && matchesStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTitle, filterTrainer, filterDate, statusFilter]);

  const totalPages = Math.ceil(filteredSchedules.length / pageSize);
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-blue-600 mb-4 tracking-tight text-center sm:text-left">Available Trainer Schedules</h2>
      {trainerMsg.text && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold border ${
            trainerMsg.type === "success"
              ? "bg-green-500/15 border-green-500/40 text-green-700"
              : "bg-red-500/15 border-red-500/40 text-red-700"
          }`}
        >
          {trainerMsg.text}
        </div>
      )}
      <div className="flex flex-nowrap gap-4 mb-6 items-center bg-blue-50/40 p-4 rounded-xl border border-slate-200 whitespace-nowrap min-w-0 overflow-x-auto no-scrollbar">
        <span className="text-slate-600 font-semibold text-xs tracking-tight mr-2 shrink-0">Filter By:</span>

        <div className="relative flex-1 max-w-[200px]">
          <input
            type="text"
            placeholder="Session title..."
            value={filterTitle}
            onChange={e => setFilterTitle(e.target.value)}
            className="bg-blue-50/50 border border-slate-200 p-2 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 transition-all text-xs font-medium placeholder:text-gray-600 w-full"
          />
        </div>

        <div className="w-px h-6 bg-slate-100 mx-2 shrink-0"></div>

        <div className="relative flex-1 max-w-[180px]">
          <input
            type="text"
            placeholder="Trainer name..."
            value={filterTrainer}
            onChange={e => setFilterTrainer(e.target.value)}
            className="bg-blue-50/50 border border-slate-200 p-2 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 transition-all text-xs font-medium placeholder:text-gray-600 w-full"
          />
        </div>

        <div className="w-px h-6 bg-slate-100 mx-2 shrink-0"></div>

        <div className="relative shrink-0">
          <DatePicker
            selected={filterDate}
            onChange={(date) => setFilterDate(date)}
            className="bg-blue-50/50 border border-slate-200 p-2 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 transition-all text-xs font-medium placeholder:text-gray-600 min-w-[140px]"
            placeholderText="Search Date"
            dateFormat="yyyy-MM-dd"
            isClearable
            portalId="root-portal"
          />
        </div>

        <div className="w-px h-6 bg-slate-100 mx-2 shrink-0"></div>

        <div className="relative shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-blue-50/50 border border-slate-200 p-2 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 transition-all min-w-[130px] text-[10px] font-bold uppercase tracking-widest cursor-pointer appearance-none pr-8"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="closed">Closed</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
        </div>

        {(filterTitle || filterTrainer || filterDate || statusFilter !== "all") && (
          <button
            onClick={() => { setFilterTitle(""); setFilterTrainer(""); setFilterDate(null); setStatusFilter("all"); }}
            className="bg-slate-50 border border-slate-200 text-slate-500 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 hover:text-slate-900 transition-all text-[10px] uppercase tracking-widest ml-auto shrink-0"
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 bg-blue-50/40 rounded-2xl border border-white/5 mx-auto max-w-md">
          <div className="text-blue-600 animate-pulse font-bold tracking-[0.3em] uppercase text-sm mb-2">Syncing Schedules</div>
          <div className="h-0.5 w-full bg-slate-50 overflow-hidden">
             <div className="h-full bg-blue-600 w-1/2 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-bold bg-red-500/5 rounded-2xl border border-red-500/10">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-blue-50/20 rounded-2xl border border-white/5 italic text-slate-600 tracking-wide">
                No available sessions match your filters.
              </div>
            ) : currentItems.map((s) => {
              // Combine date and time for precise comparison
              const sessionDateTime = new Date(`${s.date}T${s.time || "00:00"}`);
              const now = new Date();
              const isExpired = sessionDateTime < now;

              return (
                <div key={s._id} className={`p-5 border rounded-2xl bg-blue-50/40 backdrop-blur-sm transition-all group relative overflow-hidden ${isExpired ? 'border-white/5 opacity-60 grayscale-[0.8]' : 'border-slate-200 hover:border-blue-600/40 hover:bg-slate-50 shadow-xl hover:shadow-blue-600/5'}`}>
                  {!isExpired && <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600/10 rotate-45 translate-x-6 -translate-y-6 group-hover:bg-blue-700/20 transition-all"></div>}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex flex-col">
                      <h3 className={`text-xl font-bold transition-colors ${isExpired ? 'text-slate-600' : 'text-slate-900 group-hover:text-blue-600'}`}>{s.title}</h3>
                      <div className="text-[11px] text-slate-600 font-semibold mt-1 tracking-wide">Session Protocol</div>
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 rounded-lg border uppercase font-bold tracking-wider leading-none ${isExpired ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-green-500/5 text-green-700 border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]'}`}>
                      {isExpired ? "Closed" : "Available"}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-500 mb-6 bg-blue-50/40 p-4 rounded-xl border border-white/5 relative z-10">
                    <div className="flex justify-between items-center group/row">
                      <span className="font-semibold text-slate-600 text-xs tracking-tight">Assigned Trainer</span>
                      <span className={`text-sm font-semibold ${isExpired ? 'text-gray-600' : 'text-slate-900 group-hover/row:text-blue-600 transition-colors'}`}>{s.trainer?.name || "Unassigned"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-600 text-xs tracking-tight">Date</span>
                      <span className={`text-sm font-medium ${isExpired ? 'text-gray-600' : 'text-slate-900 font-mono'}`}>{s.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-600 text-xs tracking-tight">Time</span>
                      <span className={`text-sm font-bold ${isExpired ? 'text-gray-600' : 'text-blue-600 font-mono'}`}>{s.time}</span>
                    </div>
                  </div>

                  {isStudent && (
                    <button
                      onClick={() => !isExpired && handleBook(s._id)}
                      disabled={isExpired || bookingId === s._id}
                      className={`w-full font-bold py-3.5 rounded-xl transition-all uppercase text-xs tracking-wider relative z-10 ${isExpired
                        ? 'bg-slate-50 text-gray-700 cursor-not-allowed border border-white/5 mt-auto'
                        : 'bg-blue-600 text-slate-900 hover:bg-blue-700/90 shadow-lg shadow-blue-600/20 active:scale-[0.96] mt-auto'
                        }`}
                    >
                      {isExpired ? "Expired" : (bookingId === s._id ? "Processing..." : "Book Now")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-8 mt-12 pt-8 border-t border-slate-200">
              <button
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-blue-600/50 disabled:opacity-20 disabled:hover:border-slate-200 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-3 group"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Prev
              </button>

              <div className="flex items-center gap-4">
                <span className="text-blue-600 font-bold text-sm tracking-wider">{currentPage}</span>
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-none">of</span>
                <span className="text-slate-900 font-bold text-sm tracking-wider">{totalPages}</span>
              </div>

              <button
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-blue-600/50 disabled:opacity-20 disabled:hover:border-slate-200 transition-all uppercase tracking-wider text-xs font-semibold flex items-center gap-3 group"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const GYM_SCHEDULES_URL = "http://localhost:5000/api/gym-schedules";

function ymdFromLocalDate(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonthLocal(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonthsLocal(d, delta) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function weekdayShort(i) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i] || "";
}

function buildMonthGrid(monthDate) {
  const first = startOfMonthLocal(monthDate);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay()); // back to Sunday
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + w * 7 + i);
      days.push(d);
    }
    weeks.push(days);
  }
  return weeks;
}

const SlotAvailability = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [bookingKey, setBookingKey] = useState(null);
  const [bookingRules, setBookingRules] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonthLocal(new Date()));
  const [rulesOpen, setRulesOpen] = useState(false);
  const [slotMsg, setSlotMsg] = useState({ type: "", text: "" });

  const jwt = typeof localStorage !== "undefined" ? readJwtPayload() : null;
  const userId =
    (typeof localStorage !== "undefined" && localStorage.getItem("userId")) ||
    (jwt?.id ? String(jwt.id) : null);
  const isStudent =
    (typeof localStorage !== "undefined" && localStorage.getItem("role") === "student") ||
    jwt?.role === "student";

  const loadRows = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(GYM_SCHEDULES_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRows(Array.isArray(res.data) ? res.data : []);
  };

  const loadNotifications = async () => {
    if (!isStudent) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${GYM_SCHEDULES_URL}/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    axios
      .get(`${GYM_SCHEDULES_URL}/booking-rules`)
      .then((r) => setBookingRules(r.data))
      .catch(() => setBookingRules(null));
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(() => {
      if (!isStudent) return;
      loadNotifications();
      // Refresh slot status so FULL/AVAILABLE/CLOSED updates in near real-time.
      loadRows().catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await loadRows();
        setErr("");
      } catch {
        setErr("Could not load gym slots. Sign in and try again.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleBookSlot = async (scheduleId, slotId) => {
    if (!isStudent || !userId) {
      setSlotMsg({ type: "error", text: "Only student accounts can book gym slots." });
      return;
    }
    setSlotMsg({ type: "", text: "" });
    const key = `${scheduleId}-${slotId}`;
    setBookingKey(key);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${GYM_SCHEDULES_URL}/${scheduleId}/slots/${slotId}/book`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSlotMsg({ type: "success", text: "Booked. Your slot is saved." });
      await loadRows();
    } catch (e) {
      setSlotMsg({ type: "error", text: e.response?.data?.message || "Booking failed." });
    } finally {
      setBookingKey(null);
    }
  };

  const handleJoinWaitlist = async (scheduleId, slotId) => {
    if (!isStudent || !userId) {
      setSlotMsg({ type: "error", text: "Only student accounts can join gym waitlists." });
      return;
    }
    setSlotMsg({ type: "", text: "" });
    const key = `${scheduleId}-${slotId}`;
    setBookingKey(key);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${GYM_SCHEDULES_URL}/${scheduleId}/slots/${slotId}/waitlist`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSlotMsg({
        type: "success",
        text: "Added to waitlist. You will be auto-promoted when a seat opens.",
      });
      await loadRows();
    } catch (e) {
      setSlotMsg({ type: "error", text: e.response?.data?.message || "Could not join waitlist." });
    } finally {
      setBookingKey(null);
    }
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const flatSlots = [];
  for (const sched of rows) {
    for (const sl of sched.slots || []) {
      const cap = sl.capacity || 0;
      const booked = sl.bookedCount || 0;
      const open = Math.max(0, cap - booked);
      const waitlist = sl.waitlist || [];
      const bookings = sl.bookings || [];
      const iBooked =
        Boolean(userId) && bookings.some((b) => String(b.user) === String(userId));
      const iWaitlisted =
        Boolean(userId) && waitlist.some((w) => String(w.user) === String(userId));
      const waitlistCount = waitlist.length;

      const slotStart = new Date(`${sched.date}T${sl.startTime}:00`);
      const isPast = Number.isFinite(slotStart.getTime()) ? slotStart.getTime() <= Date.now() : false;
      const isClosed = Boolean(sl.isClosed) || isPast;
      const status = isClosed ? "CLOSED" : booked >= cap ? "FULL" : "AVAILABLE";
      flatSlots.push({
        scheduleId: sched._id,
        slotId: sl._id,
        date: sched.date,
        dayLabel: sched.dayLabel,
        start: sl.startTime,
        end: sl.endTime,
        capacity: cap,
        booked,
        open,
        status,
        iBooked,
        iWaitlisted,
        waitlistCount,
      });
    }
  }

  const inRange = (dateStr) => {
    if (fromDate && dateStr < fromDate) return false;
    if (toDate && dateStr > toDate) return false;
    return true;
  };

  const filtered = flatSlots.filter((s) => {
    if (!inRange(s.date)) return false;
    if (filterDate && s.date !== format(filterDate, "yyyy-MM-dd")) return false;
    return true;
  });

  const slotsByDate = useMemo(() => {
    const m = new Map();
    for (const s of flatSlots) {
      if (!m.has(s.date)) m.set(s.date, []);
      m.get(s.date).push(s);
    }
    return m;
  }, [rows]);

  const daySummary = (dateStr) => {
    const list = slotsByDate.get(dateStr) || [];
    let available = 0;
    let full = 0;
    let closed = 0;
    let openSlots = 0;
    for (const s of list) {
      if (s.status === "AVAILABLE") {
        available += 1;
        openSlots += s.open;
      } else if (s.status === "FULL") full += 1;
      else closed += 1;
    }
    return { available, full, closed, openSlots, total: list.length };
  };

  const openDayInCalendar = (d) => {
    setViewMode("list");
    setFromDate("");
    setToDate("");
    setFilterDate(d);
    setCalendarMonth(startOfMonthLocal(d));
  };

  const totalSlots = filtered.length;
  const openSpots = filtered.filter((s) => s.status === "AVAILABLE").reduce((a, s) => a + s.open, 0);
  const fullSlots = filtered.filter((s) => s.status === "FULL").length;
  const capSum = filtered.reduce((a, s) => a + s.capacity, 0);
  const bookedSum = filtered.reduce((a, s) => a + s.booked, 0);
  const occPct = capSum === 0 ? 0 : Math.round((bookedSum / capSum) * 100);

  const setPreset = (preset) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (preset === "today") {
      setFromDate(todayStr);
      setToDate(todayStr);
      setFilterDate(null);
    } else if (preset === "7") {
      setFromDate(todayStr);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      setToDate(format(end, "yyyy-MM-dd"));
      setFilterDate(null);
    } else if (preset === "30") {
      setFromDate(todayStr);
      const end = new Date(start);
      end.setDate(end.getDate() + 30);
      setToDate(format(end, "yyyy-MM-dd"));
      setFilterDate(null);
    }
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setFilterDate(null);
  };

  const selectedDayStr = filterDate ? format(filterDate, "yyyy-MM-dd") : "";

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-4xl font-bold text-blue-600 leading-tight">Gym slot availability</h2>
          <p className="text-slate-700 mt-1 text-sm sm:text-base">
            Pick a day from the calendar, then book a slot. Open slots are remaining capacity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedDayStr && (
            <span className="text-xs px-3 py-2 rounded-full bg-black border border-slate-300 text-slate-800 font-semibold">
              Selected day: <span className="text-slate-900">{selectedDayStr}</span>
            </span>
          )}
          {(fromDate || toDate || filterDate) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs px-3 py-2 rounded-full bg-blue-600/15 border border-blue-600/30 text-blue-600 font-bold hover:bg-blue-700/20"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      {isStudent && notifications.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-semibold bg-blue-600/20 text-blue-600 border border-blue-600/40">
          {notifications[0].message}
        </div>
      )}
      {slotMsg.text && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold border ${
            slotMsg.type === "success"
              ? "bg-green-500/15 border-green-500/40 text-green-700"
              : "bg-red-500/15 border-red-500/40 text-red-700"
          }`}
        >
          {slotMsg.text}
        </div>
      )}
      {bookingRules && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setRulesOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div className="font-bold text-slate-900">
              Booking rules{" "}
              <span className="text-slate-500 font-semibold text-sm">
                (tap to {rulesOpen ? "hide" : "view"})
              </span>
            </div>
            <div className="text-blue-600 font-bold">{rulesOpen ? "−" : "+"}</div>
          </button>
          {rulesOpen && (
            <ul className="text-sm text-slate-700 space-y-2 px-4 pb-4">
              <li>
                <span className="text-blue-600 font-bold">No double booking:</span> you can’t book another
                slot that overlaps the same time that day.
              </li>
              <li>
                <span className="text-blue-600 font-bold">Daily limit:</span> up to{" "}
                <span className="text-slate-900 font-semibold">{bookingRules.maxBookingsPerDay}</span> slot(s)
                per day.
              </li>
              <li>
                <span className="text-blue-600 font-bold">Gap rule:</span> your same‑day bookings must be
                more than 2 hours apart
                {bookingRules.minGapMinutes ? ` (> ${bookingRules.minGapMinutes - 1} minutes)` : ""}.
              </li>
              <li>
                <span className="text-blue-600 font-bold">Deadline:</span>{" "}
                {bookingRules.deadlineHoursBeforeSlot > 0 ? (
                  <>
                    book/move at least{" "}
                    <span className="text-slate-900 font-semibold">
                      {bookingRules.deadlineHoursBeforeSlot}
                    </span>{" "}
                    hour(s) before start.
                  </>
                ) : (
                  "no minimum advance window."
                )}
              </li>
            </ul>
          )}
        </div>
      )}
      {!isStudent && (
        <p className="text-sm text-blue-600/90 mb-4">
          Sign in with a <span className="font-bold">student</span> account to book gym slots.
        </p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-blue-50/40 border border-slate-200 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">Total slots</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? "—" : totalSlots}</div>
        </div>
        <div className="bg-blue-50/40 border border-slate-200 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">Open slots</div>
          <div className="text-2xl font-extrabold text-green-700 mt-1">{loading ? "—" : openSpots}</div>
        </div>
        <div className="bg-blue-50/40 border border-slate-200 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">Full slots</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{loading ? "—" : fullSlots}</div>
        </div>
        <div className="bg-blue-50/40 border border-slate-200 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">Occupancy</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{loading ? "—" : `${occPct}%`}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors duration-300 ${
                viewMode === "calendar"
                  ? "bg-blue-600 text-white border-blue-600/50"
                  : "bg-blue-50 text-slate-900 border-slate-300 hover:bg-blue-50/80"
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors duration-300 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white border-blue-600/50"
                  : "bg-blue-50 text-slate-900 border-slate-300 hover:bg-blue-50/80"
              }`}
            >
              List
            </button>
          </div>
          {viewMode === "calendar" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => addMonthsLocal(m, -1))}
                className="px-3 py-2 rounded bg-black border border-slate-300 text-slate-900 font-bold hover:bg-blue-50/80"
              >
                ←
              </button>
              <div className="text-slate-900 font-bold min-w-[160px] text-center">
                {calendarMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </div>
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => addMonthsLocal(m, 1))}
                className="px-3 py-2 rounded bg-black border border-slate-300 text-slate-900 font-bold hover:bg-blue-50/80"
              >
                →
              </button>
              <button
                type="button"
                onClick={() => setCalendarMonth(startOfMonthLocal(new Date()))}
                className="px-4 py-2 rounded-lg bg-blue-600/15 border border-blue-600/30 text-blue-600 font-bold hover:bg-blue-700/20"
              >
                This month
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setPreset("today")}
          className="bg-blue-600/15 text-blue-600 px-4 py-2 rounded-lg font-bold border border-blue-600/20 hover:bg-blue-700/20"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setPreset("7")}
          className="bg-blue-600/15 text-blue-600 px-4 py-2 rounded-lg font-bold border border-blue-600/20 hover:bg-blue-700/20"
        >
          Next 7 days
        </button>
        <button
          type="button"
          onClick={() => setPreset("30")}
          className="bg-blue-600/15 text-blue-600 px-4 py-2 rounded-lg font-bold border border-blue-600/20 hover:bg-blue-700/20"
        >
          Next 30 days
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="bg-blue-600 text-slate-900 px-4 py-2 rounded font-bold hover:bg-blue-700/90 transition-colors"
        >
          Clear filters
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-black border border-slate-300 rounded px-3 py-2 text-slate-900"
          placeholder="From"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-black border border-slate-300 rounded px-3 py-2 text-slate-900"
        />
        <DatePicker
          selected={filterDate}
          onChange={(d) => setFilterDate(d)}
          className="bg-black border border-slate-300 rounded px-3 py-2 text-slate-900 w-auto"
          placeholderText="Exact day"
          dateFormat="yyyy-MM-dd"
          isClearable
        />
      </div>
      </div>

      {viewMode === "calendar" && (
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-slate-500 font-bold">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center">
                {weekdayShort(i)}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {buildMonthGrid(calendarMonth).map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-2">
                {week.map((d) => {
                  const dateStr = ymdFromLocalDate(d);
                  const sum = daySummary(dateStr);
                  const inMonth = d.getMonth() === calendarMonth.getMonth();
                  const isToday = dateStr === todayStr;
                  const isSelected = Boolean(selectedDayStr) && selectedDayStr === dateStr;
                  const hasSlots = sum.total > 0;
                  const canClick = hasSlots && inMonth;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={!canClick}
                      onClick={() => openDayInCalendar(d)}
                      className={`text-left rounded-xl border p-3 min-h-[92px] transition-all duration-300 ${
                        inMonth ? "bg-slate-50" : "bg-blue-50/20"
                      } ${
                        canClick
                          ? "border-slate-200 hover:border-blue-600/40"
                          : "border-white/5 opacity-60 cursor-not-allowed"
                      } ${
                        isSelected ? "border-blue-600/70 bg-blue-600/10" : ""
                      }`}
                      title={
                        hasSlots
                          ? `${sum.available} available, ${sum.full} full, ${sum.closed} closed`
                          : "No slots"
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={`font-bold ${inMonth ? "text-slate-900" : "text-slate-600"}`}>
                          {d.getDate()}
                        </div>
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-600 border border-blue-600/30 font-bold">
                            Today
                          </span>
                        )}
                      </div>

                      {hasSlots ? (
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 font-bold">Available</span>
                            <span className="text-slate-900 font-semibold">{sum.available}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-bold">Full</span>
                            <span className="text-slate-900 font-semibold">{sum.full}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold">Open slots</span>
                            <span className="text-slate-900 font-semibold">{sum.openSlots}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-slate-600">No slots</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-slate-500">Tip: click a day to see and book its slots.</div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-blue-600 font-bold text-xl">Available slots</div>
            <div className="text-sm text-slate-500 mt-1">
              {selectedDayStr ? `Slots for ${selectedDayStr}` : "Use filters or pick a day from the calendar."}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className="bg-black border border-slate-300 text-slate-900 px-4 py-2 rounded font-bold hover:bg-blue-50/80 transition-colors"
          >
            Back to calendar
          </button>
        </div>
      )}
      {viewMode === "list" && loading ? (
        <div className="text-center py-8 text-blue-600 font-bold animate-pulse">Loading…</div>
      ) : viewMode === "list" && err ? (
        <div className="text-center py-8 text-red-700 font-bold">{err}</div>
      ) : viewMode === "list" && filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-500 italic">No slots match these filters.</div>
      ) : viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={`${s.scheduleId}-${s.slotId}`}
              className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-blue-600/40 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {s.start} – {s.end}
                </h3>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                      s.status === "CLOSED"
                        ? "bg-gray-500/20 text-slate-700"
                        : s.status === "FULL"
                          ? "bg-red-500/20 text-red-700"
                          : "bg-green-500/15 text-green-700"
                    }`}
                  >
                    {s.status === "AVAILABLE" ? "Available" : s.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 space-y-1">
                <div>
                  <span className="text-slate-900 font-bold">Date:</span> {s.date}
                  {s.dayLabel ? ` (${s.dayLabel})` : ""}
                </div>
                <div>
                  <span className="text-slate-900 font-bold">Slots:</span> {s.open} open of {s.capacity}
                </div>
              </div>
              {isStudent ? (
                s.iBooked ? (
                  <p className="mt-3 text-sm font-bold text-green-700 text-center">
                    You have booked this slot
                  </p>
                ) : s.status === "CLOSED" ? (
                  <p className="mt-3 text-sm font-bold text-slate-500 text-center">
                    Slot closed
                  </p>
                ) : s.status === "FULL" ? (
                  s.iWaitlisted ? (
                    <p className="mt-3 text-sm font-bold text-blue-600 text-center">
                      You are on the waitlist
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={bookingKey === `${s.scheduleId}-${s.slotId}`}
                      onClick={() => handleJoinWaitlist(s.scheduleId, s.slotId)}
                      className="mt-3 w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingKey === `${s.scheduleId}-${s.slotId}` ? "Joining…" : "Join waitlist"}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={bookingKey === `${s.scheduleId}-${s.slotId}`}
                    onClick={() => handleBookSlot(s.scheduleId, s.slotId)}
                    className="mt-3 w-full bg-blue-600 text-slate-900 font-bold py-2 rounded hover:bg-blue-700/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingKey === `${s.scheduleId}-${s.slotId}` ? "Booking…" : "Book slot"}
                  </button>
                )
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Schedules = () => {
  const payload = typeof localStorage !== "undefined" ? readJwtPayload() : null;
  const isStudentView = payload?.role === "student";
  const [tab, setTab] = useState("trainer");
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 -z-10"></div>
      <div className="max-w-6xl mx-auto backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          Smart Schedules
        </h1>
        {isStudentView && (
          <p className="text-center text-slate-700 -mt-5 mb-6">
            Organize gym sessions and time slots seamlessly.
          </p>
        )}
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 border ${tab === "trainer" ? "bg-blue-600 text-black border-blue-600/50" : "bg-slate-100 text-slate-900 border-slate-300 hover:bg-white/15 hover:border-blue-600/50"}`}
            onClick={() => setTab("trainer")}
          >
            Trainer Availability
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ml-2 border ${tab === "slot" ? "bg-blue-600 text-black border-blue-600/50" : "bg-slate-100 text-slate-900 border-slate-300 hover:bg-white/15 hover:border-blue-600/50"}`}
            onClick={() => setTab("slot")}
          >
            Slot Availability
          </button>
        </div>
        {tab === "trainer" && <TrainerAvailability />}
        {tab === "slot" && <SlotAvailability />}
      </div>
    </div>
  );
};

export default Schedules;



