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


  const [bookingId, setBookingId] = useState(null);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterTrainer, setFilterTrainer] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [trainerMsg, setTrainerMsg] = useState({ type: "", text: "" });

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

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesTitle = s.title?.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesTrainer = s.trainer?.name?.toLowerCase().includes(filterTrainer.toLowerCase());
    const matchesDate = filterDate ? s.date === format(filterDate, "yyyy-MM-dd") : true;
    return matchesTitle && matchesTrainer && matchesDate;
  });

  return (
    <div className="mb-8">
      <h2 className="text-4xl font-bold text-orange mb-6">Available Trainer Schedules</h2>
      {trainerMsg.text && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold border ${
            trainerMsg.type === "success"
              ? "bg-green-500/15 border-green-500/40 text-green-300"
              : "bg-red-500/15 border-red-500/40 text-red-300"
          }`}
        >
          {trainerMsg.text}
        </div>
      )}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by session title"
          value={filterTitle}
          onChange={e => setFilterTitle(e.target.value)}
          className="bg-black border border-white/20 p-3 rounded text-white placeholder-gray-400 min-w-[170px]"
        />
        <input
          type="text"
          placeholder="Filter by trainer name"
          value={filterTrainer}
          onChange={e => setFilterTrainer(e.target.value)}
          className="bg-black border border-white/20 p-3 rounded text-white placeholder-gray-400 min-w-[170px]"
        />
        <div className="relative">
          <DatePicker
            selected={filterDate}
            onChange={(date) => setFilterDate(date)}
            className="bg-black border border-white/20 p-3 rounded text-white placeholder-gray-400 min-w-[170px]"
            placeholderText="Filter by date"
            dateFormat="yyyy-MM-dd"
            isClearable
          />
        </div>
        {(filterTitle || filterTrainer || filterDate) && (
          <button
            onClick={() => { setFilterTitle(""); setFilterTrainer(""); setFilterDate(null); }}
            className="bg-orange text-white px-4 py-3 rounded font-bold hover:bg-orange/90 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center py-6 text-orange animate-pulse font-bold">Loading Sessions...</div>
      ) : error ? (
        <div className="text-center py-6 text-red-500 font-bold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 italic">No sessions match your filters.</div>
          ) : filteredSchedules.map((s) => (
            <div key={s._id} className="p-4 border border-white/10 rounded-xl bg-white/5 hover:border-orange/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-3xl font-bold text-white">{s.title}</h3>
                <span className="text-xs bg-orange/20 text-orange px-2 py-1 rounded border border-orange/30 uppercase font-bold">Open</span>
              </div>
              <div className="space-y-1 text-sm text-gray-400 mb-2">
                <div><span className="font-bold text-white">Trainer:</span> {s.trainer?.name || "N/A"}</div>
                <div><span className="font-bold text-white">Date:</span> {s.date}</div>
                <div><span className="font-bold text-white">Time:</span> {s.time}</div>
              </div>
              <button
                onClick={() => handleBook(s._id)}
                disabled={bookingId === s._id}
                className="mt-2 w-full bg-orange text-white font-bold py-2 rounded hover:bg-orange/90 transition-all disabled:opacity-60"
              >
                {bookingId === s._id ? "Booking..." : "Book"}
              </button>
            </div>
          ))}
        </div>
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
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-4xl font-bold text-orange leading-tight">Gym slot availability</h2>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">
            Pick a day from the calendar, then book a slot. Open slots are remaining capacity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedDayStr && (
            <span className="text-xs px-3 py-2 rounded-full bg-black border border-white/20 text-gray-200 font-semibold">
              Selected day: <span className="text-white">{selectedDayStr}</span>
            </span>
          )}
          {(fromDate || toDate || filterDate) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs px-3 py-2 rounded-full bg-orange/15 border border-orange/30 text-orange font-bold hover:bg-orange/20"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      {isStudent && notifications.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-semibold bg-orange/20 text-orange border border-orange/40">
          {notifications[0].message}
        </div>
      )}
      {slotMsg.text && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold border ${
            slotMsg.type === "success"
              ? "bg-green-500/15 border-green-500/40 text-green-300"
              : "bg-red-500/15 border-red-500/40 text-red-300"
          }`}
        >
          {slotMsg.text}
        </div>
      )}
      {bookingRules && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setRulesOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div className="font-bold text-white">
              Booking rules{" "}
              <span className="text-gray-400 font-semibold text-sm">
                (tap to {rulesOpen ? "hide" : "view"})
              </span>
            </div>
            <div className="text-orange font-bold">{rulesOpen ? "−" : "+"}</div>
          </button>
          {rulesOpen && (
            <ul className="text-sm text-gray-300 space-y-2 px-4 pb-4">
              <li>
                <span className="text-orange font-bold">No double booking:</span> you can’t book another
                slot that overlaps the same time that day.
              </li>
              <li>
                <span className="text-orange font-bold">Daily limit:</span> up to{" "}
                <span className="text-white font-semibold">{bookingRules.maxBookingsPerDay}</span> slot(s)
                per day.
              </li>
              <li>
                <span className="text-orange font-bold">Gap rule:</span> your same‑day bookings must be
                more than 2 hours apart
                {bookingRules.minGapMinutes ? ` (> ${bookingRules.minGapMinutes - 1} minutes)` : ""}.
              </li>
              <li>
                <span className="text-orange font-bold">Deadline:</span>{" "}
                {bookingRules.deadlineHoursBeforeSlot > 0 ? (
                  <>
                    book/move at least{" "}
                    <span className="text-white font-semibold">
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
        <p className="text-sm text-orange/90 mb-4">
          Sign in with a <span className="font-bold">student</span> account to book gym slots.
        </p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Total slots</div>
          <div className="text-2xl font-extrabold text-white mt-1">{loading ? "—" : totalSlots}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Open slots</div>
          <div className="text-2xl font-extrabold text-green-400 mt-1">{loading ? "—" : openSpots}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Full slots</div>
          <div className="text-2xl font-extrabold text-orange mt-1">{loading ? "—" : fullSlots}</div>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-400 font-bold">Occupancy</div>
          <div className="text-2xl font-extrabold text-orange mt-1">{loading ? "—" : `${occPct}%`}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors duration-300 ${
                viewMode === "calendar"
                  ? "bg-orange text-black border-orange/50"
                  : "bg-black text-white border-white/20 hover:bg-black/80"
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors duration-300 ${
                viewMode === "list"
                  ? "bg-orange text-black border-orange/50"
                  : "bg-black text-white border-white/20 hover:bg-black/80"
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
                className="px-3 py-2 rounded bg-black border border-white/20 text-white font-bold hover:bg-black/80"
              >
                ←
              </button>
              <div className="text-white font-bold min-w-[160px] text-center">
                {calendarMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </div>
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => addMonthsLocal(m, 1))}
                className="px-3 py-2 rounded bg-black border border-white/20 text-white font-bold hover:bg-black/80"
              >
                →
              </button>
              <button
                type="button"
                onClick={() => setCalendarMonth(startOfMonthLocal(new Date()))}
                className="px-4 py-2 rounded-lg bg-orange/15 border border-orange/30 text-orange font-bold hover:bg-orange/20"
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
          className="bg-orange/15 text-orange px-4 py-2 rounded-lg font-bold border border-orange/20 hover:bg-orange/20"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setPreset("7")}
          className="bg-orange/15 text-orange px-4 py-2 rounded-lg font-bold border border-orange/20 hover:bg-orange/20"
        >
          Next 7 days
        </button>
        <button
          type="button"
          onClick={() => setPreset("30")}
          className="bg-orange/15 text-orange px-4 py-2 rounded-lg font-bold border border-orange/20 hover:bg-orange/20"
        >
          Next 30 days
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="bg-orange text-white px-4 py-2 rounded font-bold hover:bg-orange/90 transition-colors"
        >
          Clear filters
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-black border border-white/20 rounded px-3 py-2 text-white"
          placeholder="From"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-black border border-white/20 rounded px-3 py-2 text-white"
        />
        <DatePicker
          selected={filterDate}
          onChange={(d) => setFilterDate(d)}
          className="bg-black border border-white/20 rounded px-3 py-2 text-white w-auto"
          placeholderText="Exact day"
          dateFormat="yyyy-MM-dd"
          isClearable
        />
      </div>
      </div>

      {viewMode === "calendar" && (
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-gray-400 font-bold">
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
                        inMonth ? "bg-white/5" : "bg-black/20"
                      } ${
                        canClick
                          ? "border-white/10 hover:border-orange/40"
                          : "border-white/5 opacity-60 cursor-not-allowed"
                      } ${
                        isSelected ? "border-orange/70 bg-orange/10" : ""
                      }`}
                      title={
                        hasSlots
                          ? `${sum.available} available, ${sum.full} full, ${sum.closed} closed`
                          : "No slots"
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={`font-bold ${inMonth ? "text-white" : "text-gray-500"}`}>
                          {d.getDate()}
                        </div>
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-orange/20 text-orange border border-orange/30 font-bold">
                            Today
                          </span>
                        )}
                      </div>

                      {hasSlots ? (
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-green-400 font-bold">Available</span>
                            <span className="text-white font-semibold">{sum.available}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-orange font-bold">Full</span>
                            <span className="text-white font-semibold">{sum.full}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-bold">Open slots</span>
                            <span className="text-white font-semibold">{sum.openSlots}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-gray-500">No slots</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-gray-400">Tip: click a day to see and book its slots.</div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-orange font-bold text-xl">Available slots</div>
            <div className="text-sm text-gray-400 mt-1">
              {selectedDayStr ? `Slots for ${selectedDayStr}` : "Use filters or pick a day from the calendar."}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className="bg-black border border-white/20 text-white px-4 py-2 rounded font-bold hover:bg-black/80 transition-colors"
          >
            Back to calendar
          </button>
        </div>
      )}
      {viewMode === "list" && loading ? (
        <div className="text-center py-8 text-orange font-bold animate-pulse">Loading…</div>
      ) : viewMode === "list" && err ? (
        <div className="text-center py-8 text-red-400 font-bold">{err}</div>
      ) : viewMode === "list" && filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400 italic">No slots match these filters.</div>
      ) : viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={`${s.scheduleId}-${s.slotId}`}
              className="p-4 border border-white/10 rounded-xl bg-white/5 hover:border-orange/40 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">
                  {s.start} – {s.end}
                </h3>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                      s.status === "CLOSED"
                        ? "bg-gray-500/20 text-gray-300"
                        : s.status === "FULL"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-green-500/15 text-green-400"
                    }`}
                  >
                    {s.status === "AVAILABLE" ? "Available" : s.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>
                  <span className="text-white font-bold">Date:</span> {s.date}
                  {s.dayLabel ? ` (${s.dayLabel})` : ""}
                </div>
                <div>
                  <span className="text-white font-bold">Slots:</span> {s.open} open of {s.capacity}
                </div>
              </div>
              {isStudent ? (
                s.iBooked ? (
                  <p className="mt-3 text-sm font-bold text-green-400 text-center">
                    You have booked this slot
                  </p>
                ) : s.status === "CLOSED" ? (
                  <p className="mt-3 text-sm font-bold text-gray-400 text-center">
                    Slot closed
                  </p>
                ) : s.status === "FULL" ? (
                  s.iWaitlisted ? (
                    <p className="mt-3 text-sm font-bold text-orange text-center">
                      You are on the waitlist
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={bookingKey === `${s.scheduleId}-${s.slotId}`}
                      onClick={() => handleJoinWaitlist(s.scheduleId, s.slotId)}
                      className="mt-3 w-full bg-orange text-black font-bold py-2 rounded hover:bg-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingKey === `${s.scheduleId}-${s.slotId}` ? "Joining…" : "Join waitlist"}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={bookingKey === `${s.scheduleId}-${s.slotId}`}
                    onClick={() => handleBookSlot(s.scheduleId, s.slotId)}
                    className="mt-3 w-full bg-orange text-white font-bold py-2 rounded hover:bg-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="min-h-screen bg-black text-white pt-24 px-6 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-orange mb-8 text-center">
          Smart Schedules
        </h1>
        {isStudentView && (
          <p className="text-center text-gray-300 -mt-5 mb-6">
            Organize gym sessions and time slots seamlessly.
          </p>
        )}
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 border ${tab === "trainer" ? "bg-orange text-black border-orange/50" : "bg-white/10 text-white border-white/20 hover:bg-white/15 hover:border-orange/50"}`}
            onClick={() => setTab("trainer")}
          >
            Trainer Availability
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ml-2 border ${tab === "slot" ? "bg-orange text-black border-orange/50" : "bg-white/10 text-white border-white/20 hover:bg-white/15 hover:border-orange/50"}`}
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
