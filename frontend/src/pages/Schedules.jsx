import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useToast } from "../hooks/useToast.js";
import ToastPopup from "../components/ToastPopup.jsx";

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
  const { toast: trainerToast, showToast: showTrainerToast, hideToast: hideTrainerToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-status-dropdown')) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const statusLabels = {
    all: "All Status",
    available: "Available",
    closed: "Closed"
  };

  const handleBook = async (session) => {
    const id = session?._id;
    if (!id) return;
    setBookingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/book/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const title = session.title?.trim() || "Session";
      const when = `${session.date} at ${session.time || "—"}`;
      showTrainerToast("success", `You're booked for “${title}” on ${when}. See you there!`);
      // Refresh the list so the booked session disappears
      const res = await axios.get(`${API_URL}/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch (err) {
      showTrainerToast(
        "error",
        friendlyApiMessage(err, "We couldn't book that session. Please try again or pick another time."),
      );
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

    // Remove if it's been more than 6 hours since the session started
    const hoursSinceStart = (now - sessionDateTime) / (1000 * 60 * 60);
    if (isExpired && hoursSinceStart > 6) {
      return false;
    }

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
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-blue-50/40 p-4 rounded-xl border border-slate-200 min-w-0">
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

        <div className="relative shrink-0 custom-status-dropdown">
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="flex items-center justify-between border border-slate-200 bg-white p-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all min-w-[130px] text-[10px] font-bold tracking-widest cursor-pointer shadow-sm"
          >
            {statusLabels[statusFilter]}
            <svg className={`w-3 h-3 text-slate-500 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isStatusDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200 right-0">
              {Object.keys(statusLabels).map(opt => (
                <div
                  key={opt}
                  onClick={() => { setStatusFilter(opt); setIsStatusDropdownOpen(false); }}
                  className={`px-4 py-2 text-[10px] font-bold tracking-widest cursor-pointer transition-colors flex items-center justify-between ${statusFilter === opt ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-blue-50/50 hover:text-blue-600'}`}
                >
                  {statusLabels[opt]}
                  {statusFilter === opt && <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
              ))}
            </div>
          )}
        </div>

        {(filterTitle || filterTrainer || filterDate || statusFilter !== "all") && (
          <button
            onClick={() => { setFilterTitle(""); setFilterTrainer(""); setFilterDate(null); setStatusFilter("all"); }}
            className="bg-slate-50 border border-slate-200 text-slate-500 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 hover:text-slate-900 transition-all text-[10px] tracking-widest ml-auto shrink-0"
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 bg-blue-50/40 rounded-2xl border border-white/5 mx-auto max-w-md">
          <div className="text-blue-600 animate-pulse font-bold tracking-[0.3em] text-sm mb-2">Syncing Schedules</div>
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
              const isLocked = !isExpired && (sessionDateTime - now) < (60 * 60 * 1000);

              return (
                <div key={s._id} className={`p-5 border rounded-2xl bg-blue-50/40 backdrop-blur-sm transition-all group relative overflow-hidden ${isExpired ? 'border-white/5 opacity-60 grayscale-[0.8]' : 'border-slate-200 hover:border-blue-600/40 hover:bg-slate-50 shadow-xl hover:shadow-blue-600/5'}`}>
                  {!isExpired && <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600/10 rotate-45 translate-x-6 -translate-y-6 group-hover:bg-blue-700/20 transition-all"></div>}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex flex-col">
                      <h3 className={`text-xl font-bold transition-colors ${isExpired ? 'text-slate-600' : 'text-slate-900 group-hover:text-blue-600'}`}>{s.title}</h3>
                      <div className="text-[11px] text-slate-600 font-semibold mt-1 tracking-wide">Session Plan</div>
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold tracking-wider leading-none ${isExpired ? 'bg-red-500/5 text-red-500 border-red-500/10' : isLocked ? 'bg-amber-500/5 text-amber-600 border-amber-500/10' : 'bg-green-500/5 text-green-700 border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]'}`}>
                      {isExpired ? "Closed" : isLocked ? "Booking Closed" : "Available"}
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
                      onClick={() => !isExpired && !isLocked && handleBook(s)}
                      disabled={isExpired || isLocked || bookingId === s._id}
                      className={`w-full font-bold py-3.5 rounded-xl transition-all text-xs tracking-wider relative z-10 ${isExpired || isLocked
                        ? 'bg-slate-50 text-gray-700 cursor-not-allowed border border-white/5 mt-auto'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.96] mt-auto'
                        }`}
                    >
                      {isExpired ? "Expired" : isLocked ? "Too Late to Book" : (bookingId === s._id ? "Processing..." : "Book Now")}
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
      <ToastPopup toast={trainerToast} onDismiss={hideTrainerToast} />
    </div>
  );
};

const GYM_SCHEDULES_URL = "http://localhost:5000/api/gym-schedules";

/** Prefer API message when present; otherwise a short, friendly fallback. */
function friendlyApiMessage(err, fallback) {
  const m = err?.response?.data?.message;
  if (typeof m === "string" && m.trim()) return m.trim();
  return fallback;
}

function gymSlotBookingLabel(s) {
  if (!s) return "";
  const day = s.dayLabel ? `${s.date} (${s.dayLabel})` : s.date;
  return `${day} · ${s.start}–${s.end}`;
}

/** Normalize Mongoose user ref (ObjectId string or populated `{ _id }`). */
function bookingUserId(entry) {
  const u = entry?.user;
  if (u == null) return "";
  if (typeof u === "object" && u._id != null) return String(u._id);
  return String(u);
}

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
  const { toast: slotToast, showToast: showSlotToast, hideToast: hideSlotToast } = useToast();
  const reminderAnnouncedRef = useRef(new Set());
  const [browserNotifyPermission, setBrowserNotifyPermission] = useState(() =>
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported",
  );

  const jwt = typeof localStorage !== "undefined" ? readJwtPayload() : null;
  // Prefer JWT id (matches Authorization header) over stored userId to avoid stale account after switch.
  const userId =
    jwt?.id != null && jwt.id !== ""
      ? String(jwt.id)
      : typeof localStorage !== "undefined" && localStorage.getItem("userId")
        ? String(localStorage.getItem("userId"))
        : null;
  const isStudent =
    (typeof localStorage !== "undefined" && localStorage.getItem("role") === "student") ||
    jwt?.role === "student";

  const loadRows = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setRows([]);
      return;
    }
    try {
      const res = await axios.get(GYM_SCHEDULES_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRows([]);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
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
  }, [isStudent]);

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
  }, [isStudent, loadNotifications, loadRows]);

  // Refetch schedules when another student logs in on this tab so "your" bookings vs others stay correct.
  useEffect(() => {
    const onAuthChange = () => {
      setBookingKey(null);
      reminderAnnouncedRef.current = new Set();
      void loadRows();
      void loadNotifications();
    };
    window.addEventListener("tokenChanged", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("tokenChanged", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, [loadRows, loadNotifications]);

  const sortedNotifications = useMemo(() => {
    const list = Array.isArray(notifications) ? [...notifications] : [];
    list.sort((a, b) => {
      const ar = a.kind === "REMINDER_BEFORE_SESSION" ? 0 : 1;
      const br = b.kind === "REMINDER_BEFORE_SESSION" ? 0 : 1;
      if (ar !== br) return ar - br;
      const tb = new Date(b.createdAt || 0).getTime();
      const ta = new Date(a.createdAt || 0).getTime();
      return tb - ta;
    });
    return list;
  }, [notifications]);

  useEffect(() => {
    if (!isStudent || !sortedNotifications.length) return;
    const fresh = sortedNotifications.filter(
      (n) =>
        n.kind === "REMINDER_BEFORE_SESSION" &&
        !n.isRead &&
        !reminderAnnouncedRef.current.has(String(n._id)),
    );
    if (!fresh.length) return;
    for (const n of fresh) reminderAnnouncedRef.current.add(String(n._id));

    if (fresh.length === 1) {
      showSlotToast("info", fresh[0].message, 9000);
    } else {
      showSlotToast(
        "info",
        `You have ${fresh.length} gym slot reminders starting soon. Check the reminders above for dates and times.`,
        9000,
      );
    }

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      for (const n of fresh) {
        if (!n.message) continue;
        try {
          new Notification("Gym booking reminder", {
            body: n.message,
            tag: `gym-reminder-${n._id}`,
          });
        } catch {
          /* ignore */
        }
      }
    }
  }, [isStudent, sortedNotifications, showSlotToast]);

  const requestBrowserReminders = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setBrowserNotifyPermission(p);
    if (p === "granted") {
      showSlotToast("success", "Browser reminders on. We'll alert you when a gym slot is coming up.");
    }
  };

  const dismissNotification = async (notificationId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.put(
        `${GYM_SCHEDULES_URL}/my-notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await loadNotifications();
    } catch {
      showSlotToast("error", "Couldn't dismiss that notification. Try again.");
    }
  };

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
  }, [loadRows]);

  const handleBookSlot = async (scheduleId, slotId, detailLabel) => {
    if (!isStudent || !userId) {
      showSlotToast(
        "error",
        "Gym slots are for students. Sign in with a student account to book.",
      );
      return;
    }
    const key = `${scheduleId}-${slotId}`;
    setBookingKey(key);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${GYM_SCHEDULES_URL}/${scheduleId}/slots/${slotId}/book`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const label = detailLabel || "Your slot";
      showSlotToast(
        "success",
        `You're in! Your gym slot is saved: ${label}. You can review it anytime on this page.`,
      );
      await loadRows();
    } catch (e) {
      showSlotToast(
        "error",
        friendlyApiMessage(
          e,
          "We couldn't book that slot. It may be full, closed, or no longer available—try another time.",
        ),
      );
    } finally {
      setBookingKey(null);
    }
  };

  const handleJoinWaitlist = async (scheduleId, slotId, detailLabel) => {
    if (!isStudent || !userId) {
      showSlotToast(
        "error",
        "The waitlist is for students. Sign in with a student account to join.",
      );
      return;
    }
    const key = `${scheduleId}-${slotId}`;
    setBookingKey(key);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${GYM_SCHEDULES_URL}/${scheduleId}/slots/${slotId}/waitlist`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const label = detailLabel || "This slot";
      showSlotToast(
        "success",
        `You're on the waitlist for ${label}. If someone cancels, we'll move you up automatically.`,
      );
      await loadRows();
    } catch (e) {
      showSlotToast(
        "error",
        friendlyApiMessage(e, "We couldn't add you to the waitlist. Please wait a moment and try again."),
      );
    } finally {
      setBookingKey(null);
    }
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const flatSlots = useMemo(() => {
    const out = [];
    const nowMs = Date.now();
    for (const sched of rows) {
      for (const sl of sched.slots || []) {
        const cap = sl.capacity || 0;
        const booked = sl.bookedCount || 0;
        const open = Math.max(0, cap - booked);
        const waitlist = sl.waitlist || [];
        const bookings = sl.bookings || [];
        const uid = userId ? String(userId) : "";
        const iBooked = Boolean(uid) && bookings.some((b) => bookingUserId(b) === uid);
        const iWaitlisted =
          Boolean(uid) && waitlist.some((w) => bookingUserId(w) === uid);
        const waitlistCount = waitlist.length;

        const slotStart = new Date(`${sched.date}T${sl.startTime}:00`);
        const isPast = Number.isFinite(slotStart.getTime()) ? slotStart.getTime() <= nowMs : false;
        const isClosed = Boolean(sl.isClosed) || isPast;
        const status = isClosed ? "CLOSED" : booked >= cap ? "FULL" : "AVAILABLE";
        out.push({
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
    return out;
  }, [rows, userId]);

  const inRange = (dateStr) => {
    if (fromDate && dateStr < fromDate) return false;
    if (toDate && dateStr > toDate) return false;
    return true;
  };

  const filtered = useMemo(() => {
    return flatSlots.filter((s) => {
      if (!inRange(s.date)) return false;
      if (filterDate && s.date !== format(filterDate, "yyyy-MM-dd")) return false;
      return true;
    });
  }, [flatSlots, fromDate, toDate, filterDate]);

  const slotsByDate = useMemo(() => {
    const m = new Map();
    for (const s of flatSlots) {
      if (!m.has(s.date)) m.set(s.date, []);
      m.get(s.date).push(s);
    }
    return m;
  }, [flatSlots]);

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
            <span className="text-xs px-3 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
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
      {isStudent && sortedNotifications.length > 0 && (
        <div className="mb-4 space-y-2" role="status">
          {sortedNotifications.slice(0, 5).map((n) => (
            <div
              key={n._id}
              className={`flex flex-col gap-2 rounded-lg border px-4 py-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between ${
                n.kind === "REMINDER_BEFORE_SESSION"
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-950"
                  : "border-blue-600/40 bg-blue-600/20 text-blue-800"
              }`}
            >
              <span className="min-w-0 leading-snug">
                {n.kind === "REMINDER_BEFORE_SESSION" ? (
                  <span className="mr-1 font-extrabold text-amber-900">Reminder · </span>
                ) : null}
                {n.message}
              </span>
              <button
                type="button"
                onClick={() => dismissNotification(n._id)}
                className="shrink-0 rounded-lg border border-current/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-white/40"
              >
                Dismiss
              </button>
            </div>
          ))}
          {browserNotifyPermission === "default" ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>Want an alert on this device when your slot is coming up?</span>
              <button
                type="button"
                onClick={requestBrowserReminders}
                className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700"
              >
                Turn on browser alerts
              </button>
            </div>
          ) : null}
          {browserNotifyPermission === "denied" ? (
            <p className="text-xs text-slate-500">
              Browser notifications are blocked. You can allow them in your site settings to get desk alerts for gym
              reminders.
            </p>
          ) : null}
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
              {bookingRules.reminderMinutesBeforeSlot > 0 ? (
                <li>
                  <span className="text-blue-600 font-bold">Reminders:</span> when a booked slot is within{" "}
                  <span className="text-slate-900 font-semibold">{bookingRules.reminderMinutesBeforeSlot}</span>{" "}
                  minutes of starting, you&apos;ll see an in-app reminder here with date and time (and an optional
                  browser alert if you enable it).
                </li>
              ) : null}
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
                className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-blue-700 font-bold hover:bg-blue-50"
              >
                ←
              </button>
              <div className="text-slate-900 font-bold min-w-[160px] text-center">
                {calendarMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </div>
              <button
                type="button"
                onClick={() => setCalendarMonth((m) => addMonthsLocal(m, 1))}
                className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-blue-700 font-bold hover:bg-blue-50"
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Clear filters
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          placeholder="From"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
        <DatePicker
          selected={filterDate}
          onChange={(d) => setFilterDate(d)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 w-auto focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
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
            className="bg-white border border-slate-300 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
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
                      onClick={() => handleJoinWaitlist(s.scheduleId, s.slotId, gymSlotBookingLabel(s))}
                      className="mt-3 w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingKey === `${s.scheduleId}-${s.slotId}` ? "Joining…" : "Join waitlist"}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={bookingKey === `${s.scheduleId}-${s.slotId}`}
                    onClick={() => handleBookSlot(s.scheduleId, s.slotId, gymSlotBookingLabel(s))}
                    className="mt-3 w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingKey === `${s.scheduleId}-${s.slotId}` ? "Booking…" : "Book slot"}
                  </button>
                )
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <ToastPopup toast={slotToast} onDismiss={hideSlotToast} />
    </div>
  );
};

const Schedules = () => {
  const payload = typeof localStorage !== "undefined" ? readJwtPayload() : null;
  const isStudentView = payload?.role === "student";
  const [tab, setTab] = useState("trainer");
  return (
    <div className="page-bg-base pt-24 px-6 relative">
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
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 border ${tab === "trainer" ? "bg-blue-600 text-white border-blue-600/50" : "bg-slate-100 text-slate-900 border-slate-300 hover:bg-white/15 hover:border-blue-600/50"}`}
            onClick={() => setTab("trainer")}
          >
            Trainer Availability
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg transition-colors duration-200 ml-2 border ${tab === "slot" ? "bg-blue-600 text-white border-blue-600/50" : "bg-slate-100 text-slate-900 border-slate-300 hover:bg-white/15 hover:border-blue-600/50"}`}
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



