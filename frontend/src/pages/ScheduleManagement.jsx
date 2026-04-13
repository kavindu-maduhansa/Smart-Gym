import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useToast } from "../hooks/useToast.js";
import ToastPopup from "../components/ToastPopup.jsx";

const API = "http://localhost:5000/api/gym-schedules";

/** Must match backend — only this slot length is allowed. */
const GYM_SLOT_DURATION_MINUTES = 120;

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function AnalyticsSectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-24 rounded-lg bg-slate-200/70" />
        <div className="h-24 rounded-lg bg-slate-200/70 md:col-span-2" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-52 rounded-xl bg-slate-200/70" />
        <div className="h-52 rounded-xl bg-slate-200/70" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-40 rounded-xl bg-slate-200/70" />
        <div className="h-40 rounded-xl bg-slate-200/70" />
      </div>
      <div className="h-20 rounded-xl bg-slate-200/70" />
    </div>
  );
}

function BarChart2({ peak, low }) {
  const peakPct = peak ? clamp(peak.utilizationPct, 0, 100) : 0;
  const lowPct = low ? clamp(low.utilizationPct, 0, 100) : 0;
  const maxH = 140;
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 bg-blue-50/30 border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-500 font-bold">Peak</div>
          <div
            className="mt-3 mx-auto rounded-md bg-red-500/20 border border-red-500/30"
            style={{ height: `${(peakPct / 100) * maxH}px`, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}
          >
            <div className="text-blue-600 font-bold text-sm">{peakPct}%</div>
          </div>
          <div className="mt-3 text-xs text-slate-500 text-center truncate">
            {peak ? peak.key.split("-").join(" to ") : "—"}
          </div>
        </div>
        <div className="flex-1 bg-blue-50/30 border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-500 font-bold">Low</div>
          <div
            className="mt-3 mx-auto rounded-md bg-green-500/15 border border-green-500/30"
            style={{ height: `${(lowPct / 100) * maxH}px`, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}
          >
            <div className="text-blue-600 font-bold text-sm">{lowPct}%</div>
          </div>
          <div className="mt-3 text-xs text-slate-500 text-center truncate">
            {low ? low.key.split("-").join(" to ") : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

const PIE_SLICE_COLORS = [
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#64748b",
];

/** Wedge from center (cx,cy) with radius r, angles in radians, -π/2 = top. */
function pieWedgePath(cx, cy, r, startRad, endRad) {
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endRad - startRad > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

/**
 * Daily rows from analytics: each slice = that day’s share of bookings (or of capacity if no bookings).
 */
function DailyUsagePieChart({ points }) {
  const list = Array.isArray(points) ? points : [];
  if (list.length === 0) return <div className="text-slate-500 text-sm">No data</div>;

  const bookedSum = list.reduce((a, p) => a + (Number(p.bookedSeats) || 0), 0);
  const capSum = list.reduce((a, p) => a + (Number(p.capacitySeats) || 0), 0);
  const useBooked = bookedSum > 0;
  const total = useBooked ? bookedSum : capSum;
  if (total <= 0) return <div className="text-slate-500 text-sm">No capacity data for this range.</div>;

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 88;

  let acc = 0;
  const slices = list.map((p, i) => {
    const raw = useBooked ? Number(p.bookedSeats) || 0 : Number(p.capacitySeats) || 0;
    const portion = raw / total;
    const startRad = acc * 2 * Math.PI - Math.PI / 2;
    acc += portion;
    const endRad = acc * 2 * Math.PI - Math.PI / 2;
    const sharePct = Math.round(portion * 1000) / 10;
    return {
      key: `${p.date}-${i}`,
      date: p.date,
      path: pieWedgePath(cx, cy, r, startRad, endRad),
      color: PIE_SLICE_COLORS[i % PIE_SLICE_COLORS.length],
      utilizationPct: p.utilizationPct ?? 0,
      sharePct,
      mode: useBooked ? "booked" : "capacity",
    };
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-[220px] w-[220px] shrink-0">
          {slices.map((s) => (
            <path
              key={s.key}
              d={s.path}
              fill={s.color}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.5"
              className="transition-opacity hover:opacity-90"
            />
          ))}
        </svg>
        <ul className="min-w-0 flex-1 space-y-1.5 text-xs sm:text-sm">
          {slices.map((s) => (
            <li key={`leg-${s.key}`} className="flex items-center gap-2 text-slate-700">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="font-mono font-semibold text-slate-900">{s.date}</span>
              <span className="text-slate-500">
                {s.utilizationPct}% util · {s.sharePct}% of {s.mode === "booked" ? "bookings" : "capacity"}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {useBooked
          ? "Slice size = share of total bookings across these days."
          : "No bookings in range — slice size = share of scheduled capacity by day."}
      </p>
    </div>
  );
}

function timeToMinutes(t) {
  if (!t || typeof t !== "string") return NaN;
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

/** Same weekday rules as backend (UTC calendar date). */
function getOpeningHoursForDate(yyyyMmDd) {
  const [Y, M, D] = yyyyMmDd.split("-").map(Number);
  const wd = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
  if (wd === 0) return { openingTime: "09:00", closingTime: "13:00", label: "Sunday" };
  if (wd === 6) return { openingTime: "09:00", closingTime: "18:00", label: "Saturday" };
  return { openingTime: "08:00", closingTime: "20:00", label: "Monday–Friday" };
}

function formatAmPm(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const pm = h >= 12;
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${pm ? "PM" : "AM"}`;
}

function validateForm(
  values,
  { dateResolved, allowPastDate = false, editingId = null, existingSchedules = [] } = {},
) {
  const err = {};
  const dateStr = (dateResolved ?? values.date).trim();

  if (!dateStr) {
    err.date = "Choose a date for this schedule.";
  } else if (!DATE_OK(dateStr)) {
    err.date = "Pick a valid calendar date.";
  } else if (!allowPastDate && isScheduleDateBeforeToday(dateStr)) {
    err.date = "Date cannot be in the past.";
  } else if (
    Array.isArray(existingSchedules) &&
    existingSchedules.some(
      (row) => row.date === dateStr && String(row._id) !== String(editingId || ""),
    )
  ) {
    err.date =
      "This date already has a schedule. Edit or delete it first—duplicate generation is not allowed.";
  }

  if (!err.date && DATE_OK(dateStr)) {
    const { openingTime, closingTime } = getOpeningHoursForDate(dateStr);
    const span = timeToMinutes(closingTime) - timeToMinutes(openingTime);
    if (span < GYM_SLOT_DURATION_MINUTES) {
      err.slotDurationMinutes =
        "That day’s open hours are shorter than one 120-minute slot; pick another date.";
    }
  }

  const cap = Number(values.capacityPerSlot);
  if (values.capacityPerSlot === "" || values.capacityPerSlot === null) {
    err.capacityPerSlot = "Capacity is required.";
  } else if (Number.isNaN(cap)) {
    err.capacityPerSlot = "Capacity must be a number.";
  } else if (!Number.isInteger(cap) || cap < 1 || cap > 10) {
    err.capacityPerSlot = "Use 1–10 people per slot (whole numbers).";
  }

  const label = values.dayLabel != null ? String(values.dayLabel).trim() : "";
  if (label.length > 80) {
    err.dayLabel = "Keep the label to 80 characters or fewer.";
  } else if (label && /[<>]/.test(label)) {
    err.dayLabel = "Label cannot contain < or >.";
  }

  return err;
}

const emptyForm = () => ({
  date: "",
  dayLabel: "",
  capacityPerSlot: "10",
});

const ScheduleManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});

  const [slotModal, setSlotModal] = useState(null); // { scheduleId, date, dayLabel, slots: [] }
  /** Bumps on an interval while the slot modal is open so “ended” slots update without a refresh. */
  const [slotTimeTick, setSlotTimeTick] = useState(0);
  const [slotActionKey, setSlotActionKey] = useState(null);
  const [slotCapEdits, setSlotCapEdits] = useState({});
  const [slotSearch, setSlotSearch] = useState("");
  const [bulkCap, setBulkCap] = useState("10");
  const [scheduleQuery, setScheduleQuery] = useState("");
  const [showPastSchedules, setShowPastSchedules] = useState(false);

  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  /** Re-render schedule rows when “today” crosses closing time (same interval as analytics). */
  const [scheduleListTick, setScheduleListTick] = useState(0);

  const { toast, showToast, hideToast } = useToast();

  const previewHours = useMemo(() => {
    const d = form.date?.trim();
    if (!d || !DATE_OK(d)) return null;
    return getOpeningHoursForDate(d);
  }, [form.date]);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const load = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.get(API, authHeader());
      setItems(res.data || []);
    } catch {
      const m =
        "We couldn't load schedules. Check your connection, make sure you're signed in as admin, then refresh.";
      setMsg(m);
      showToast("error", m);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setAnalyticsError("Please login as admin to load analytics.");
        setAnalytics(null);
        return;
      }

      const res = await axios.get(`${API}/analytics?days=${analyticsDays}`, authHeader());
      setAnalytics(res.data || null);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        err?.message ||
        "Failed to load analytics.";
      setAnalyticsError(message);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsDays]);

  useEffect(() => {
    fetchAnalytics();
    const t = window.setInterval(() => {
      fetchAnalytics();
      setScheduleListTick((n) => n + 1);
    }, 30000);
    return () => window.clearInterval(t);
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!slotModal) return undefined;
    const id = window.setInterval(() => setSlotTimeTick((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, [slotModal?.scheduleId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditId(null);
    setFieldErrors({});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (editId) {
      const existing = items.find((x) => String(x._id) === String(editId));
      if (existing && isScheduleDateBeforeToday(existing.date)) {
        const m =
          "That day is in the past. You can view it for records, but schedules can't be edited.";
        setMsg(m);
        showToast("error", m);
        return;
      }
      if (existing && isScheduleGymDayOverForAdmin(existing.date, existing.closingTime)) {
        const m =
          "Today's gym hours have ended for that schedule. You can view it but not edit until a new day.";
        setMsg(m);
        showToast("error", m);
        return;
      }
    }

    const dateVal = form.date && form.date.trim() ? form.date.trim() : "";

    const payload = {
      date: dateVal,
      dayLabel: form.dayLabel.trim(),
      slotDurationMinutes: GYM_SLOT_DURATION_MINUTES,
      capacityPerSlot: Number(form.capacityPerSlot),
    };

    const fe = validateForm(
      { ...form, date: dateVal },
      {
        dateResolved: dateVal,
        allowPastDate: false,
        editingId: editId,
        existingSchedules: items,
      },
    );
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, payload, authHeader());
        const ok = `Updated ${dateVal}. Time slots were rebuilt with your new settings.`;
        setMsg(ok);
        showToast("success", ok);
      } else {
        await axios.post(API, payload, authHeader());
        const ok = `Gym slots for ${dateVal} are live. Up to ${payload.capacityPerSlot} people can book each slot.`;
        setMsg(ok);
        showToast("success", ok);
      }
      resetForm();
      await load();
      fetchAnalytics();
    } catch (err) {
      const m =
        err.response?.data?.message ||
        "Something went wrong while saving. Please try again, or refresh and check your details.";
      setMsg(m);
      showToast("error", m);
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row) => {
    if (isScheduleDateBeforeToday(row.date)) {
      const m =
        "That day is in the past. You can view it for records, but schedules can't be edited.";
      setMsg(m);
      showToast("error", m);
      return;
    }
    if (isScheduleGymDayOverForAdmin(row.date, row.closingTime)) {
      const m =
        "Today's gym hours have ended. You can view this schedule but not edit it until tomorrow.";
      setMsg(m);
      showToast("error", m);
      return;
    }
    setEditId(row._id);
    setForm({
      date: row.date,
      dayLabel: row.dayLabel || "",
      capacityPerSlot: String(row.capacityPerSlot),
    });
    setFieldErrors({});
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    const row = items.find((x) => String(x._id) === String(id));
    if (row && isScheduleDateBeforeToday(row.date)) {
      const m =
        "Past schedules stay in the system for history and reports, so they can't be deleted.";
      setMsg(m);
      showToast("error", m);
      return;
    }
    if (row && isScheduleGymDayOverForAdmin(row.date, row.closingTime)) {
      const m =
        "Today's gym hours have ended. This schedule is read-only until tomorrow — it can't be deleted now.";
      setMsg(m);
      showToast("error", m);
      return;
    }
    if (!window.confirm("Remove this schedule and all its slots?")) return;
    setMsg("");
    try {
      await axios.delete(`${API}/${id}`, authHeader());
      const ok = "Removed. That day's schedule and all its time slots are gone.";
      setMsg(ok);
      showToast("success", ok);
      if (editId === id) resetForm();
      await load();
      fetchAnalytics();
    } catch (err) {
      const m =
        err.response?.data?.message ||
        "We couldn't delete that schedule. It may still have active bookings—try again or adjust slots first.";
      setMsg(m);
      showToast("error", m);
    }
  };

  const openSlotsModal = (row) => {
    const slots = Array.isArray(row.slots) ? row.slots : [];
    setSlotModal({
      scheduleId: row._id,
      date: row.date,
      dayLabel: row.dayLabel || "",
      closingTime: row.closingTime || "",
      slots,
    });
    const edits = {};
    for (const s of slots) {
      edits[String(s._id)] = String(s.capacity ?? row.capacityPerSlot ?? 10);
    }
    setSlotCapEdits(edits);
    setSlotActionKey(null);
  };

  const closeSlotsModal = () => {
    setSlotModal(null);
    setSlotCapEdits({});
    setSlotActionKey(null);
    setSlotSearch("");
  };

  const refreshOneScheduleIntoModal = async (scheduleId) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
    const list = Array.isArray(res.data) ? res.data : [];
    setItems(list);
    const fresh = list.find((x) => String(x._id) === String(scheduleId));
    if (!fresh) return;
    openSlotsModal(fresh);
  };

  const bulkApplyCapacity = async () => {
    if (!slotModal?.scheduleId) return;
    if (
      slotModal.date &&
      (isScheduleDateBeforeToday(slotModal.date) ||
        isScheduleGymDayOverForAdmin(slotModal.date, slotModal.closingTime))
    ) {
      showToast("error", "This schedule is read-only. You can view slots but not change them.");
      return;
    }
    const scheduleId = slotModal.scheduleId;
    const slots = slotModal.slots || [];
    const cap = Number(bulkCap);
    if (!Number.isFinite(cap) || !Number.isInteger(cap)) {
      const m = "Please enter a whole number for capacity (no decimals).";
      setMsg(m);
      showToast("error", m);
      return;
    }
    setSlotActionKey(`bulk-cap-${scheduleId}`);
    try {
      for (const s of slots) {
        if (isGymSlotEndedByNow(slotModal.date, s.endTime)) continue;
        const booked = Number(s.bookedCount || 0);
        if (cap < booked) continue; // skip impossible
        await adminSetSlotCapacity(scheduleId, s._id);
      }
      await refreshOneScheduleIntoModal(scheduleId);
      fetchAnalytics();
      showToast(
        "success",
        "Capacity updated where we could. Slots that already have more bookings than the new limit were left unchanged.",
      );
    } finally {
      setSlotActionKey(null);
    }
  };

  const bulkCloseAll = async () => {
    if (!slotModal?.scheduleId) return;
    if (
      slotModal.date &&
      (isScheduleDateBeforeToday(slotModal.date) ||
        isScheduleGymDayOverForAdmin(slotModal.date, slotModal.closingTime))
    ) {
      showToast("error", "This schedule is read-only. You can view slots but not change them.");
      return;
    }
    const scheduleId = slotModal.scheduleId;
    setSlotActionKey(`bulk-close-${scheduleId}`);
    try {
      for (const s of slotModal.slots || []) {
        if (isGymSlotEndedByNow(slotModal.date, s.endTime)) continue;
        if (s.isClosed) continue;
        await adminCloseSlot(scheduleId, s._id);
      }
      await refreshOneScheduleIntoModal(scheduleId);
      fetchAnalytics();
      showToast(
        "success",
        "Done. Every open slot for this day is now closed—no new bookings until you reopen them.",
      );
    } finally {
      setSlotActionKey(null);
    }
  };

  const bulkOpenAll = async () => {
    if (!slotModal?.scheduleId) return;
    if (
      slotModal.date &&
      (isScheduleDateBeforeToday(slotModal.date) ||
        isScheduleGymDayOverForAdmin(slotModal.date, slotModal.closingTime))
    ) {
      showToast("error", "This schedule is read-only. You can view slots but not change them.");
      return;
    }
    const scheduleId = slotModal.scheduleId;
    setSlotActionKey(`bulk-open-${scheduleId}`);
    try {
      for (const s of slotModal.slots || []) {
        if (isGymSlotEndedByNow(slotModal.date, s.endTime)) continue;
        if (!s.isClosed) continue;
        await adminOpenSlot(scheduleId, s._id);
      }
      await refreshOneScheduleIntoModal(scheduleId);
      fetchAnalytics();
      showToast(
        "success",
        "Closed slots are open again. Members can book them if there's space.",
      );
    } finally {
      setSlotActionKey(null);
    }
  };

  const adminCloseSlot = async (scheduleId, slotId) => {
    const row = items.find((x) => String(x._id) === String(scheduleId));
    if (row?.date && isScheduleDateBeforeToday(row.date)) {
      showToast("error", "Past schedules are read-only.");
      return;
    }
    if (row?.date && isScheduleGymDayOverForAdmin(row.date, row.closingTime)) {
      showToast("error", "This gym day has ended; the schedule is read-only.");
      return;
    }
    const sl = row?.slots?.find((x) => String(x._id) === String(slotId));
    if (sl && row?.date && isGymSlotEndedByNow(row.date, sl.endTime)) {
      showToast("error", "This time slot has ended; it can no longer be changed.");
      return;
    }
    const key = `close-${scheduleId}-${slotId}`;
    setSlotActionKey(key);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/${scheduleId}/slots/${slotId}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await refreshOneScheduleIntoModal(scheduleId);
      fetchAnalytics();
      showToast("success", "This time slot is closed. New bookings are blocked until you reopen it.");
    } finally {
      setSlotActionKey(null);
    }
  };

  const adminOpenSlot = async (scheduleId, slotId) => {
    const row = items.find((x) => String(x._id) === String(scheduleId));
    if (row?.date && isScheduleDateBeforeToday(row.date)) {
      showToast("error", "Past schedules are read-only.");
      return;
    }
    if (row?.date && isScheduleGymDayOverForAdmin(row.date, row.closingTime)) {
      showToast("error", "This gym day has ended; the schedule is read-only.");
      return;
    }
    const sl = row?.slots?.find((x) => String(x._id) === String(slotId));
    if (sl && row?.date && isGymSlotEndedByNow(row.date, sl.endTime)) {
      showToast("error", "This time slot has ended; it can no longer be changed.");
      return;
    }
    const key = `open-${scheduleId}-${slotId}`;
    setSlotActionKey(key);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/${scheduleId}/slots/${slotId}/open`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await refreshOneScheduleIntoModal(scheduleId);
      fetchAnalytics();
      showToast("success", "This time slot is open again for bookings (within capacity).");
    } finally {
      setSlotActionKey(null);
    }
  };

  const adminSetSlotCapacity = async (scheduleId, slotId) => {
    const row = items.find((x) => String(x._id) === String(scheduleId));
    if (row?.date && isScheduleDateBeforeToday(row.date)) {
      showToast("error", "Past schedules are read-only.");
      return;
    }
    if (row?.date && isScheduleGymDayOverForAdmin(row.date, row.closingTime)) {
      showToast("error", "This gym day has ended; the schedule is read-only.");
      return;
    }
    const sl = row?.slots?.find((x) => String(x._id) === String(slotId));
    if (sl && row?.date && isGymSlotEndedByNow(row.date, sl.endTime)) {
      showToast("error", "This time slot has ended; it can no longer be changed.");
      return;
    }
    const key = `cap-${scheduleId}-${slotId}`;
    setSlotActionKey(key);
    try {
      const token = localStorage.getItem("token");
      const cap = Number(slotCapEdits[String(slotId)]);
      await axios.post(
        `${API}/${scheduleId}/slots/${slotId}/capacity`,
        { capacity: cap },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await refreshOneScheduleIntoModal(scheduleId);
      fetchAnalytics();
      showToast("success", "Slot capacity saved. Existing bookings are unchanged.");
    } catch (err) {
      const m =
        err.response?.data?.message ||
        "We couldn't update that slot's capacity. Use a number at least as high as current bookings, then try again.";
      setMsg(m);
      showToast("error", m);
    } finally {
      setSlotActionKey(null);
    }
  };

  const isErrorMsg =
    /fail|could not|couldn't|not |cannot|can't|invalid|required|must |already|duplicate|blocked|wrong|try again|check your connection|stay in the system|view it for records/i.test(
      msg,
    ) || msg.includes("403");

  const slotModalIsPast = useMemo(
    () => Boolean(slotModal?.date && isScheduleDateBeforeToday(slotModal.date)),
    [slotModal?.date],
  );

  const slotModalReadOnly = useMemo(
    () =>
      Boolean(
        slotModal?.date &&
          (isScheduleDateBeforeToday(slotModal.date) ||
            isScheduleGymDayOverForAdmin(slotModal.date, slotModal.closingTime)),
      ),
    [slotModal?.date, slotModal?.closingTime, slotTimeTick, scheduleListTick],
  );

  const slotModalAllSlotsEnded = useMemo(() => {
    if (!slotModal?.date || slotModalReadOnly) return false;
    const slots = slotModal.slots || [];
    if (!slots.length) return false;
    return slots.every((s) => isGymSlotEndedByNow(slotModal.date, s.endTime));
  }, [slotModal?.date, slotModal?.slots, slotModalReadOnly, slotTimeTick]);

  const filteredSchedules = useMemo(() => {
    const q = String(scheduleQuery || "").trim().toLowerCase();
    const list = Array.isArray(items) ? items : [];
    return list
      .filter((row) => {
        if (!row?.date) return false;
        if (!showPastSchedules && isScheduleDateBeforeToday(row.date)) return false;
        if (!q) return true;
        const label = String(row.dayLabel || "").toLowerCase();
        return String(row.date).toLowerCase().includes(q) || label.includes(q);
      })
      .sort((a, b) => {
        const aPast = isScheduleDateBeforeToday(a.date);
        const bPast = isScheduleDateBeforeToday(b.date);
        if (aPast !== bPast) return aPast ? 1 : -1; // today & upcoming first, past at bottom
        return String(a.date).localeCompare(String(b.date));
      });
  }, [items, scheduleQuery, showPastSchedules, scheduleListTick]);

  const summarizeScheduleSlots = (row) => {
    const slots = Array.isArray(row?.slots) ? row.slots : [];
    let open = 0;
    let full = 0;
    let closed = 0;
    let openSpots = 0;
    for (const s of slots) {
      const cap = Number(s?.capacity || 0);
      const booked = Number(s?.bookedCount || 0);
      const isClosed = Boolean(s?.isClosed);
      if (isClosed) {
        closed += 1;
        continue;
      }
      if (cap > 0 && booked >= cap) {
        full += 1;
        continue;
      }
      open += 1;
      openSpots += Math.max(0, cap - booked);
    }
    return { open, full, closed, openSpots, total: slots.length };
  };

  return (
    <div className="page-bg-base overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 ambient-gradient" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center mb-4">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mr-3 sm:mr-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Schedule Management
              </h1>
            </div>
            <p className="text-slate-700 text-base sm:text-lg">
              Pick a date and capacity. Open hours follow the gym’s weekly rules; every generated slot
              is exactly <span className="text-blue-600 font-bold">{GYM_SLOT_DURATION_MINUTES} minutes</span>.
            </p>
          </div>

          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-5 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-7 h-7 text-blue-600 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg font-bold text-slate-900">Opening hours</h2>
            </div>
            <div className="divide-y divide-white/10 rounded-lg bg-blue-50/35 border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                <span className="text-slate-700">Monday – Friday</span>
                <span className="text-slate-900 font-semibold">
                  {formatAmPm("08:00")} – {formatAmPm("20:00")}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                <span className="text-slate-700">Saturday</span>
                <span className="text-slate-900 font-semibold">
                  {formatAmPm("09:00")} – {formatAmPm("18:00")}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                <span className="text-slate-700">Sunday</span>
                <span className="text-slate-900 font-semibold">
                  {formatAmPm("09:00")} – {formatAmPm("13:00")}
                </span>
              </div>
            </div>
            {previewHours && (
              <p className="mt-3 text-sm text-blue-600/90">
                Selected date uses <span className="font-bold">{previewHours.label}</span> hours:{" "}
                {previewHours.openingTime}–{previewHours.closingTime} (slots fill this range only).
              </p>
            )}
          </div>

          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-xl p-6 sm:p-8 mb-8">
            {msg && (
              <div
                className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold ${
                  isErrorMsg
                    ? "bg-red-500/20 text-red-800 border border-red-500/40"
                    : "bg-blue-600/20 text-blue-600 border border-blue-600/40"
                }`}
              >
                {msg}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-1">
                    Date <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={form.date}
                    onChange={onChange}
                    aria-invalid={fieldErrors.date ? "true" : "false"}
                    className={`w-full bg-blue-50/50 border rounded-lg px-3 py-2 text-slate-900 ${
                      fieldErrors.date ? "border-red-500/70" : "border-slate-300"
                    }`}
                  />
                  {fieldErrors.date && (
                    <p className="text-red-700 text-xs mt-1">{fieldErrors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-1">
                    Day label (optional)
                  </label>
                  <input
                    type="text"
                    name="dayLabel"
                    value={form.dayLabel}
                    onChange={onChange}
                    maxLength={80}
                    placeholder="e.g. Monday promo block"
                    className={`w-full bg-blue-50/50 border rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 ${
                      fieldErrors.dayLabel ? "border-red-500/70" : "border-slate-300"
                    }`}
                  />
                  {fieldErrors.dayLabel && (
                    <p className="text-red-700 text-xs mt-1">{fieldErrors.dayLabel}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-1">
                    Slot duration
                  </label>
                  <div className="w-full bg-blue-50/40 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm">
                    {GYM_SLOT_DURATION_MINUTES} minutes <span className="text-slate-600">(fixed)</span>
                  </div>
                  {fieldErrors.slotDurationMinutes && (
                    <p className="text-red-700 text-xs mt-1">
                      {fieldErrors.slotDurationMinutes}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-600 mb-1">Capacity per slot</label>
                  <input
                    type="number"
                    name="capacityPerSlot"
                    required
                    min={1}
                    max={10}
                    step={1}
                    inputMode="numeric"
                    value={form.capacityPerSlot}
                    onChange={onChange}
                    aria-invalid={fieldErrors.capacityPerSlot ? "true" : "false"}
                    className={`w-full bg-blue-50/50 border rounded-lg px-3 py-2 text-slate-900 ${
                      fieldErrors.capacityPerSlot ? "border-red-500/70" : "border-slate-300"
                    }`}
                  />
                  {fieldErrors.capacityPerSlot && (
                    <p className="text-red-700 text-xs mt-1">{fieldErrors.capacityPerSlot}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700/90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : editId ? "Update schedule" : "Generate slots"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-100 border border-white/30 font-bold px-6 py-2 rounded-lg hover:bg-white/15"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-blue-600">Existing schedules</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Search by date or label. Schedules on a <span className="font-semibold text-slate-600">past
                  calendar day</span> are view-only. For <span className="font-semibold text-slate-600">today</span>,
                  editing stops after that day’s <span className="font-semibold text-slate-600">closing time</span>{" "}
                  (same as the hours shown on the card). Future days stay editable. Use “Manage slots” only while
                  the day is still open for changes.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  value={scheduleQuery}
                  onChange={(e) => setScheduleQuery(e.target.value)}
                  placeholder="Search (e.g. 2026-03-26 or exam)"
                  className="bg-blue-50/40 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 w-full sm:w-[280px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPastSchedules((v) => !v)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm border transition-colors ${
                    showPastSchedules
                      ? "bg-blue-600 text-white border-blue-600/50"
                      : "bg-blue-50/30 text-slate-800 border-slate-200 hover:bg-blue-50/40"
                  }`}
                >
                  {showPastSchedules ? "Showing past" : "Hide past"}
                </button>
              </div>
            </div>
            {loading ? (
              <p className="text-slate-500">Loading…</p>
            ) : filteredSchedules.length === 0 ? (
              <p className="text-slate-500">Nothing here yet. Add your first block above.</p>
            ) : (
              <div
                className="space-y-4 max-h-[480px] overflow-y-auto pr-2"
                data-schedule-list-tick={scheduleListTick}
              >
                {filteredSchedules.map((row) => {
                  const sum = summarizeScheduleSlots(row);
                  const scheduleIsPast = isScheduleDateBeforeToday(row.date);
                  const scheduleIsToday = scheduleYmdEqualsLocalToday(row.date);
                  const scheduleDayClosed =
                    !scheduleIsPast && isScheduleGymDayOverForAdmin(row.date, row.closingTime);
                  const scheduleReadOnly = scheduleIsPast || scheduleDayClosed;
                  return (
                    <div
                      key={row._id}
                      className="border border-slate-200 rounded-lg p-4 bg-blue-50/30"
                    >
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">
                            {normalizeScheduleDateYmd(row.date) || row.date}
                            {row.dayLabel ? ` · ${row.dayLabel}` : ""}
                            {!scheduleIsPast && scheduleIsToday ? (
                              <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wide text-blue-600">
                                Today
                              </span>
                            ) : null}
                            {scheduleDayClosed ? (
                              <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wide text-slate-500">
                                Day ended
                              </span>
                            ) : null}
                          </p>
                          <p className="text-sm text-slate-500">
                            {row.openingTime} – {row.closingTime} · {row.slotDurationMinutes} min slots ·
                            cap {row.capacityPerSlot} · {row.slots?.length || 0} slots
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-green-500/15 text-green-700 border border-green-500/30 font-bold">
                              OPEN {sum.open}
                            </span>
                            <span className="px-2 py-1 rounded bg-red-500/15 text-red-700 border border-red-500/30 font-bold">
                              FULL {sum.full}
                            </span>
                            <span className="px-2 py-1 rounded bg-gray-500/20 text-slate-800 border border-slate-200 font-bold">
                              CLOSED {sum.closed}
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-50 text-slate-800 border border-slate-200 font-bold">
                              OPEN SPOTS {sum.openSpots}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openSlotsModal(row)}
                            className={`text-sm px-3 py-1 rounded border font-semibold ${
                              scheduleReadOnly
                                ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                : "bg-slate-100 text-slate-900 border-slate-300 hover:bg-white/15"
                            }`}
                          >
                            {scheduleReadOnly ? "View slots" : "Manage slots"}
                          </button>
                          {!scheduleReadOnly ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onEdit(row)}
                                className="text-sm bg-blue-600/20 text-blue-600 px-3 py-1 rounded border border-blue-600/40 font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(row._id)}
                                className="text-sm bg-red-500/20 text-red-700 px-3 py-1 rounded border border-red-500/40 font-semibold"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold self-center px-1">
                              {scheduleIsPast ? "Past — view only" : "Day ended — view only"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="backdrop-blur-md bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 mt-8 mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-blue-600">Utilization & Peak Analytics</h2>
                  {analyticsLoading && analytics ? (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 animate-pulse">
                      Refreshing…
                    </span>
                  ) : null}
                </div>
                <p className="text-slate-700 text-sm mt-1">
                  Auto-updates every 30 seconds. Peak detection uses admin-open slots only.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAnalyticsDays(d)}
                    className={`px-3 py-2 rounded-lg font-bold text-sm border transition-all ${
                      analyticsDays === d
                        ? "bg-blue-600 text-white border-blue-600/50"
                        : "bg-blue-50/20 text-slate-700 border-slate-200 hover:bg-blue-50/30"
                    }`}
                  >
                    Last {d}d
                  </button>
                ))}
              </div>
            </div>

            {analyticsError && (
              <div className="text-red-700 text-sm mb-3 font-bold border border-red-500/30 bg-red-500/10 rounded-lg p-3">
                {analyticsError}
              </div>
            )}

            {analyticsLoading && !analytics && !analyticsError ? <AnalyticsSectionSkeleton /> : null}

            {analytics && (
              <>
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50/30 border border-slate-200 rounded-lg p-4">
                      <div className="text-sm text-slate-500 font-bold">Overall utilization</div>
                      <div className="text-3xl font-bold text-blue-600 mt-2">
                        {analytics.overallUtilizationPct}%
                      </div>
                    </div>
                    <div className="bg-blue-50/30 border border-slate-200 rounded-lg p-4 md:col-span-2">
                      <div className="text-sm text-slate-500 font-bold">Least busy time</div>
                      <div className="text-lg font-bold text-slate-900 mt-2">
                        {analytics.low ? analytics.low.key.split("-").join(" to ") : analytics.leastBusyTime}
                      </div>
                      <div className="text-sm text-slate-700 mt-1">
                        {analytics.low
                          ? `Utilization: ${analytics.low.utilizationPct}%`
                          : "No peak data yet."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50/30 border border-slate-200 rounded-xl p-4">
                    <div className="text-slate-500 font-bold mb-3">Bar chart (Peak vs Low)</div>
                    <BarChart2 peak={analytics.peak} low={analytics.low} />
                  </div>
                  <div className="bg-blue-50/30 border border-slate-200 rounded-xl p-4">
                    <div className="text-slate-500 font-bold mb-3">Pie chart (Daily usage)</div>
                    <DailyUsagePieChart points={analytics.daily || []} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50/30 border border-slate-200 rounded-xl p-4">
                    <div className="text-slate-500 font-bold mb-3">Popular slots</div>
                    {Array.isArray(analytics.popularSlots) && analytics.popularSlots.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.popularSlots.slice(0, 5).map((s) => (
                          <div
                            key={s.key}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <div className="text-slate-900 font-semibold">
                              {String(s.key).split("-").join(" to ")}
                            </div>
                            <div className="text-blue-600 font-bold text-sm">
                              {s.utilizationPct}% <span className="text-slate-500 font-semibold">({s.bookedSeats}/{s.capacitySeats})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">No usage data yet.</div>
                    )}
                  </div>

                  <div className="bg-blue-50/30 border border-slate-200 rounded-xl p-4">
                    <div className="text-slate-500 font-bold mb-3">Empty slots</div>
                    {Array.isArray(analytics.emptySlots) && analytics.emptySlots.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.emptySlots.slice(0, 5).map((s) => (
                          <div
                            key={s.key}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <div className="text-slate-900 font-semibold">
                              {String(s.key).split("-").join(" to ")}
                            </div>
                            <div className="text-slate-700 font-bold text-sm">
                              0% <span className="text-slate-600 font-semibold">({s.bookedSeats}/{s.capacitySeats})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">No empty slots in this range.</div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50/30 border border-slate-200 rounded-xl p-4">
                  <div className="text-slate-500 font-bold mb-2">Best approach</div>
                  <p className="text-slate-900/90 text-sm">{analytics.bestApproach}</p>
                </div>
              </>
            )}
          </div>

          {slotModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50/70 px-4"
              data-admin-slot-tick={slotTimeTick}
              data-schedule-list-tick={scheduleListTick}
            >
              <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl">
                <div className="sticky top-0 z-10 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 bg-white/95 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-blue-600 font-bold text-xl">
                        {slotModalReadOnly || slotModalAllSlotsEnded ? "View slots" : "Manage slots"}
                      </div>
                      <div className="text-slate-700 text-sm mt-1">
                        {slotModal.date}
                        {slotModal.dayLabel ? ` · ${slotModal.dayLabel}` : ""}
                      </div>
                      {slotModalReadOnly ? (
                        slotModalIsPast ? (
                          <p className="text-xs text-slate-500 mt-2 font-semibold">
                            This day is in the past — slots are read-only.
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-2 font-semibold">
                            This gym day has ended (after {slotModal.closingTime || "closing"}) — view only until
                            tomorrow.
                          </p>
                        )
                      ) : slotModalAllSlotsEnded ? (
                        <p className="text-xs text-slate-500 mt-2 font-semibold">
                          Every time window for this day has ended — you can review slots but not change them.
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={closeSlotsModal}
                      className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 font-bold hover:bg-white/15"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <input
                    type="text"
                    value={slotSearch}
                    onChange={(e) => setSlotSearch(e.target.value)}
                    placeholder="Search time (e.g. 10:00)"
                    className="w-full md:w-60 bg-blue-50/50 border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder-slate-400"
                  />
                  {!slotModalReadOnly && !slotModalAllSlotsEnded ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        type="button"
                        disabled={slotActionKey === `bulk-close-${slotModal.scheduleId}`}
                        onClick={bulkCloseAll}
                        className="px-3 py-2 rounded bg-red-500/15 border border-red-500/30 text-red-800 font-bold hover:bg-red-500/20 disabled:opacity-60"
                      >
                        Close all
                      </button>
                      <button
                        type="button"
                        disabled={slotActionKey === `bulk-open-${slotModal.scheduleId}`}
                        onClick={bulkOpenAll}
                        className="px-3 py-2 rounded bg-slate-100 border border-slate-300 text-slate-900 font-bold hover:bg-white/15 disabled:opacity-60"
                      >
                        Open all
                      </button>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          step={1}
                          value={bulkCap}
                          onChange={(e) => setBulkCap(e.target.value)}
                          className="w-28 bg-blue-50/50 border border-slate-300 rounded px-2 py-2 text-slate-900"
                        />
                        <button
                          type="button"
                          disabled={slotActionKey === `bulk-cap-${slotModal.scheduleId}`}
                          onClick={bulkApplyCapacity}
                          className="px-3 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700/90 disabled:opacity-60"
                        >
                          Set cap (all)
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {(slotModal.slots || [])
                    .filter((s) => {
                      const q = String(slotSearch || "").trim().toLowerCase();
                      if (!q) return true;
                      return (
                        String(s.startTime || "").toLowerCase().includes(q) ||
                        String(s.endTime || "").toLowerCase().includes(q)
                      );
                    })
                    .map((s) => {
                    const booked = Number(s.bookedCount || 0);
                    const cap = Number(s.capacity || 0);
                    const isClosed = Boolean(s.isClosed);
                    const slotEnded = isGymSlotEndedByNow(slotModal.date, s.endTime);
                    return (
                      <div
                        key={String(s._id)}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-slate-900 font-bold">
                              {s.startTime} – {s.endTime}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              Booked: <span className="text-slate-900 font-semibold">{booked}</span> /{" "}
                              <span className="text-slate-900 font-semibold">{cap}</span>{" "}
                              {isClosed ? (
                                <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-500/20 text-slate-800 border border-slate-200 font-bold">
                                  CLOSED
                                </span>
                              ) : (
                                <span className="ml-2 text-xs px-2 py-1 rounded bg-green-500/15 text-green-700 border border-green-500/30 font-bold">
                                  OPEN
                                </span>
                              )}
                              {slotEnded ? (
                                <span className="ml-2 text-xs px-2 py-1 rounded bg-slate-200/80 text-slate-700 border border-slate-300 font-bold">
                                  ENDED
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {!slotModalReadOnly && !slotEnded ? (
                            <div className="flex flex-wrap gap-2 items-center">
                              {isClosed ? (
                                <button
                                  type="button"
                                  disabled={slotActionKey === `open-${slotModal.scheduleId}-${s._id}`}
                                  onClick={() => adminOpenSlot(slotModal.scheduleId, s._id)}
                                  className="px-3 py-2 rounded bg-slate-100 border border-slate-300 text-slate-900 font-bold hover:bg-white/15 disabled:opacity-60"
                                >
                                  Reopen
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={slotActionKey === `close-${slotModal.scheduleId}-${s._id}`}
                                  onClick={() => adminCloseSlot(slotModal.scheduleId, s._id)}
                                  className="px-3 py-2 rounded bg-red-500/15 border border-red-500/30 text-red-800 font-bold hover:bg-red-500/20 disabled:opacity-60"
                                >
                                  Close slot
                                </button>
                              )}

                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={booked}
                                  max={10}
                                  step={1}
                                  value={slotCapEdits[String(s._id)] ?? ""}
                                  onChange={(e) =>
                                    setSlotCapEdits((m) => ({ ...m, [String(s._id)]: e.target.value }))
                                  }
                                  className="w-28 bg-blue-50/50 border border-slate-300 rounded px-2 py-2 text-slate-900"
                                />
                                <button
                                  type="button"
                                  disabled={slotActionKey === `cap-${slotModal.scheduleId}-${s._id}`}
                                  onClick={() => adminSetSlotCapacity(slotModal.scheduleId, s._id)}
                                  className="px-3 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700/90 disabled:opacity-60"
                                >
                                  Set cap
                                </button>
                              </div>
                            </div>
                          ) : !slotModalReadOnly && slotEnded ? (
                            <div className="text-xs font-semibold text-slate-500 self-center">
                              This window has ended — view only.
                            </div>
                          ) : null}
                        </div>
                        {!slotModalReadOnly && !slotEnded ? (
                          <div className="text-xs text-slate-600 mt-2">
                            Capacity can’t be reduced below current bookings.
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={closeSlotsModal}
                    className="px-4 py-2 rounded bg-slate-100 border border-slate-300 text-slate-900 font-bold hover:bg-white/15"
                  >
                    Close
                  </button>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastPopup toast={toast} onDismiss={hideToast} />
    </div>
  );
};

function DATE_OK(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

/** Leading YYYY-MM-DD (handles values that start with an ISO timestamp). */
function normalizeScheduleDateYmd(raw) {
  const s = String(raw || "").trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function combineScheduleDateAndTimeLocal(yyyyMmDdRaw, hhmm) {
  const ymd = normalizeScheduleDateYmd(yyyyMmDdRaw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return new Date(NaN);
  const [y, M, d] = ymd.split("-").map(Number);
  const parts = String(hhmm || "").split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (!Number.isFinite(y) || !Number.isFinite(M) || !Number.isFinite(d)) return new Date(NaN);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return new Date(NaN);
  return new Date(y, M - 1, d, h, m, 0, 0);
}

/** Matches backend admin rule when device timezone matches the server (set TZ in production). */
function isGymSlotEndedByNow(scheduleDateRaw, endTime) {
  const end = combineScheduleDateAndTimeLocal(scheduleDateRaw, endTime);
  if (!Number.isFinite(end.getTime())) return true;
  return Date.now() >= end.getTime();
}

/** Today’s row is locked after the schedule’s closing time (e.g. 20:00); past calendar days stay locked all day. */
function isScheduleGymDayOverForAdmin(scheduleDateRaw, closingTime) {
  if (isScheduleDateBeforeToday(scheduleDateRaw)) return true;
  if (!scheduleYmdEqualsLocalToday(scheduleDateRaw)) return false;
  const ymd = normalizeScheduleDateYmd(scheduleDateRaw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const end = combineScheduleDateAndTimeLocal(ymd, closingTime);
  if (!Number.isFinite(end.getTime())) return false;
  return Date.now() >= end.getTime();
}

function localCalendarTodayYmd() {
  const t = new Date();
  const y = t.getFullYear();
  const mo = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

/** Same rule as backend `scheduleDateIsBeforeToday` when server TZ matches this device. */
function isScheduleDateBeforeToday(dateStr) {
  const s = normalizeScheduleDateYmd(dateStr);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return s < localCalendarTodayYmd();
}

function scheduleYmdEqualsLocalToday(dateStr) {
  const s = normalizeScheduleDateYmd(dateStr);
  return Boolean(s && s === localCalendarTodayYmd());
}

export default ScheduleManagement;




