import mongoose from "mongoose";
import GymSchedule from "../models/GymSchedule.js";
import GymNotification from "../models/GymNotification.js";
import { getOpeningHoursForDate } from "../utils/gymOpeningHours.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Gym floor slots are always generated in this length only. */
const GYM_SLOT_DURATION_MINUTES = 120;

/** Max gym slot bookings per student per calendar day (set GYM_MAX_BOOKINGS_PER_DAY in .env). */
const MAX_GYM_BOOKINGS_PER_STUDENT_PER_DAY = Math.max(
  1,
  parseInt(process.env.GYM_MAX_BOOKINGS_PER_DAY || "2", 10) || 2,
);

/**
 * Latest moment to book/move into a slot: at least this many hours before slot start
 * (set GYM_BOOKING_DEADLINE_HOURS in .env; 0 = no deadline).
 */
const GYM_BOOKING_DEADLINE_HOURS = Math.max(
  0,
  parseFloat(process.env.GYM_BOOKING_DEADLINE_HOURS || "2") || 0,
);

/** Minimum gap required between same-day slots for one student (set GYM_MIN_GAP_MINUTES). */
const GYM_MIN_GAP_MINUTES = Math.max(
  0,
  parseInt(process.env.GYM_MIN_GAP_MINUTES || "121", 10) || 121,
);

/**
 * Latest moment to change/cancel a booking: at least this many minutes before slot start
 * (set GYM_CHANGE_DEADLINE_MINUTES in .env; default 60).
 */
const GYM_CHANGE_DEADLINE_MINUTES = Math.max(
  0,
  parseInt(process.env.GYM_CHANGE_DEADLINE_MINUTES || "60", 10) || 60,
);

function combineDateAndTimeLocal(yyyyMmDd, hhmm) {
  const [y, M, d] = yyyyMmDd.split("-").map(Number);
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(y, M - 1, d, h, m, 0, 0);
}

/** True if [s1,e1) overlaps [s2,e2) in same-day minute space. */
function timeRangesOverlap(start1, end1, start2, end2) {
  return timeToMinutes(start1) < timeToMinutes(end2) && timeToMinutes(start2) < timeToMinutes(end1);
}

function assertBookingDeadlineOrMessage(scheduleDate, startTime) {
  if (GYM_BOOKING_DEADLINE_HOURS <= 0) return null;
  const slotStart = combineDateAndTimeLocal(scheduleDate, startTime);
  const latestBookTime = new Date(slotStart.getTime() - GYM_BOOKING_DEADLINE_HOURS * 3600000);
  if (Date.now() > latestBookTime.getTime()) {
    return `Booking deadline: you must book at least ${GYM_BOOKING_DEADLINE_HOURS} hour(s) before this slot starts.`;
  }
  return null;
}

function assertChangeDeadlineOrMessage(scheduleDate, startTime, actionLabel = "change") {
  if (GYM_CHANGE_DEADLINE_MINUTES <= 0) return null;
  const slotStart = combineDateAndTimeLocal(scheduleDate, startTime);
  const latestChangeTime = new Date(
    slotStart.getTime() - GYM_CHANGE_DEADLINE_MINUTES * 60000,
  );
  if (Date.now() > latestChangeTime.getTime()) {
    return `Too late to ${actionLabel}: you can only ${actionLabel} a booking at least ${GYM_CHANGE_DEADLINE_MINUTES} minute(s) before the slot starts.`;
  }
  return null;
}

function isSlotInPast(scheduleDate, startTime) {
  const slotStart = combineDateAndTimeLocal(scheduleDate, startTime);
  return Date.now() >= slotStart.getTime();
}

async function countStudentGymBookingsOnDate(userId, scheduleDateYmd, scheduleDoc) {
  // When we already have the schedule doc in-memory (book/move/cancel), use it
  // so validation reflects pending changes.
  if (scheduleDoc && String(scheduleDoc.date) === String(scheduleDateYmd)) {
    let n = 0;
    for (const sl of scheduleDoc.slots || []) {
      if ((sl.bookings || []).some((b) => String(b.user) === String(userId))) n++;
    }
    return n;
  }

  const schedule = await GymSchedule.findOne({ date: scheduleDateYmd });
  if (!schedule) return 0;
  let n = 0;
  for (const sl of schedule.slots || []) {
    if ((sl.bookings || []).some((b) => String(b.user) === String(userId))) n++;
  }
  return n;
}

/** Another slot the student holds on this schedule overlaps the target time window (no double booking). */
function userHasOverlappingGymSlot(schedule, userId, targetSlot, excludeSlotIds = []) {
  const ex = new Set(excludeSlotIds.map((id) => String(id)));
  for (const sl of schedule.slots || []) {
    if (ex.has(String(sl._id))) continue;
    if (!(sl.bookings || []).some((b) => String(b.user) === String(userId))) continue;
    if (
      timeRangesOverlap(sl.startTime, sl.endTime, targetSlot.startTime, targetSlot.endTime)
    ) {
      return true;
    }
  }
  return false;
}

function userHasTooSmallGapFromOtherGymSlots(
  schedule,
  userId,
  targetSlot,
  minGapMinutes,
  excludeSlotIds = [],
) {
  const ex = new Set(excludeSlotIds.map((id) => String(id)));
  const tStart = timeToMinutes(targetSlot.startTime);
  const tEnd = timeToMinutes(targetSlot.endTime);

  for (const sl of schedule.slots || []) {
    if (ex.has(String(sl._id))) continue;
    if (!(sl.bookings || []).some((b) => String(b.user) === String(userId))) continue;

    const oStart = timeToMinutes(sl.startTime);
    const oEnd = timeToMinutes(sl.endTime);
    const gap = tStart >= oEnd ? tStart - oEnd : oStart - tEnd;
    if (gap <= minGapMinutes) return true;
  }

  return false;
}

async function validateTargetSlotForStudent(userId, toSched, toSlot, options = {}) {
  const { skipDailyLimit = false, excludeSlotIds = [], scheduleDoc = null } = options;

  const deadlineMsg = assertBookingDeadlineOrMessage(toSched.date, toSlot.startTime);
  if (deadlineMsg) return deadlineMsg;

  // Auto status logic: CLOSED when admin closes OR when the start time has passed.
  if (toSlot?.isClosed) return "Slot is closed.";
  if (isSlotInPast(toSched.date, toSlot.startTime)) return "Slot is closed.";

  if (!skipDailyLimit) {
    const c = await countStudentGymBookingsOnDate(userId, toSched.date, scheduleDoc);
    if (c >= MAX_GYM_BOOKINGS_PER_STUDENT_PER_DAY) {
      return `Daily booking limit: you can book at most ${MAX_GYM_BOOKINGS_PER_STUDENT_PER_DAY} gym slot(s) per calendar day.`;
    }
  }

  if (userHasOverlappingGymSlot(toSched, userId, toSlot, excludeSlotIds)) {
    return "No double booking: you already have another slot that overlaps this time.";
  }

  if (
    userHasTooSmallGapFromOtherGymSlots(
      toSched,
      userId,
      toSlot,
      GYM_MIN_GAP_MINUTES,
      excludeSlotIds,
    )
  ) {
    return `Slot gap rule: your slots on the same day must be more than 2 hours apart (>${GYM_MIN_GAP_MINUTES - 1} minutes).`;
  }

  return null;
}

async function createGymNotification(userId, message, options = {}) {
  const { type = "gym", kind = "", ref = "" } = options || {};
  // Keep notifications lightweight; createdAt/timestamps are stored by schema.
  await GymNotification.create({ user: userId, message, type, kind, ref });
}

async function createGymNotificationOnce(userId, message, options = {}) {
  const { type = "gym", kind = "", ref = "" } = options || {};
  if (!kind || !ref) {
    await createGymNotification(userId, message, { type, kind, ref });
    return;
  }
  try {
    await GymNotification.create({ user: userId, message, type, kind, ref });
  } catch (err) {
    if (err && err.code === 11000) return; // duplicate
    throw err;
  }
}

function formatSlotNotification(scheduleDate, dayLabel, startTime, endTime) {
  const dayPart = dayLabel ? ` · ${dayLabel}` : "";
  return `${scheduleDate}${dayPart} · ${startTime}–${endTime}`;
}

async function autoPromoteWaitlist(schedule, slot) {
  // If not available, nothing to do.
  if (slot.bookedCount >= slot.capacity) return;
  const waitlist = slot.waitlist || [];
  if (!waitlist.length) return;

  // Promote in FIFO order.
  const ordered = [...waitlist].sort((a, b) => {
    const at = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
    const bt = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
    return at - bt;
  });

  for (const entry of ordered) {
    if (slot.bookedCount >= slot.capacity) break;
    const candidateId = entry.user;
    const ruleErr = await validateTargetSlotForStudent(
      candidateId,
      schedule,
      slot,
      {
        skipDailyLimit: false,
        excludeSlotIds: [],
        scheduleDoc: schedule,
      },
    );

    // If deadline passed, remove the entry (it can never be promoted).
    if (ruleErr && typeof ruleErr === "string" && ruleErr.startsWith("Booking deadline:")) {
      slot.waitlist = (slot.waitlist || []).filter(
        (w) => String(w.user) !== String(candidateId),
      );
      continue;
    }

    if (ruleErr) continue;

    // Promote: remove from waitlist and add to bookings.
    slot.waitlist = (slot.waitlist || []).filter(
      (w) => String(w.user) !== String(candidateId),
    );
    slot.bookings = slot.bookings || [];
    slot.bookings.push({ user: candidateId, bookedAt: new Date() });
    slot.bookedCount = (slot.bookedCount || 0) + 1;

    await createGymNotification(
      candidateId,
      `Auto-promotion: you have been booked for gym slot ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      { kind: "WAITLIST_PROMOTED", ref: `${String(schedule._id)}:${String(slot._id)}` },
    );
    break; // one seat freed per cancellation/move (but we keep loop safe if multiple)
  }
}

function normalizeScheduleDate(date) {
  return String(date || "").trim();
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildSlotsFromWindow(
  openingTime,
  closingTime,
  durationMinutes,
  capacityPerSlot,
) {
  const openM = timeToMinutes(openingTime);
  const closeM = timeToMinutes(closingTime);
  if (closeM <= openM) {
    throw new Error("Closing time must be after opening time.");
  }
  if (durationMinutes < 5 || durationMinutes > 480) {
    throw new Error("Slot duration must be between 5 and 480 minutes.");
  }
  const slots = [];
  for (let cur = openM; cur + durationMinutes <= closeM; cur += durationMinutes) {
    slots.push({
      startTime: minutesToTime(cur),
      endTime: minutesToTime(cur + durationMinutes),
      capacity: capacityPerSlot,
      bookedCount: 0,
    });
  }
  if (slots.length === 0) {
    throw new Error(
      "No slots fit in this window. Shorten slot duration or widen open hours.",
    );
  }
  return slots;
}

function validateSchedulePayload(body, { partial } = { partial: false }) {
  const errors = [];
  const { date, dayLabel, slotDurationMinutes, capacityPerSlot } = body;

  if (!partial || date !== undefined) {
    const dStr = normalizeScheduleDate(date);
    if (!date || typeof date !== "string") {
      errors.push("Date is required (YYYY-MM-DD).");
    } else if (!DATE_RE.test(dStr)) {
      errors.push("Date must use YYYY-MM-DD format.");
    } else {
      const d = new Date(`${dStr}T12:00:00`);
      if (Number.isNaN(d.getTime())) {
        errors.push("Date is not valid.");
      }
    }
  }

  if (!partial || slotDurationMinutes !== undefined) {
    const n = Number(slotDurationMinutes);
    if (slotDurationMinutes === undefined || slotDurationMinutes === "") {
      errors.push("Slot duration is required.");
    } else if (!Number.isFinite(n) || !Number.isInteger(n)) {
      errors.push("Slot duration must be a whole number of minutes.");
    } else if (n !== GYM_SLOT_DURATION_MINUTES) {
      errors.push(`Slot duration is fixed at ${GYM_SLOT_DURATION_MINUTES} minutes.`);
    }
  }

  if (!partial || capacityPerSlot !== undefined) {
    const c = Number(capacityPerSlot);
    if (capacityPerSlot === undefined || capacityPerSlot === "") {
      errors.push("Capacity per slot is required.");
    } else if (!Number.isFinite(c) || !Number.isInteger(c)) {
      errors.push("Capacity must be a whole number.");
    } else if (c < 1 || c > 10) {
      errors.push("Capacity must be between 1 and 10.");
    }
  }

  if (dayLabel !== undefined && dayLabel !== null && typeof dayLabel !== "string") {
    errors.push("Day label must be text.");
  } else if (typeof dayLabel === "string" && dayLabel.length > 80) {
    errors.push("Day label must be 80 characters or less.");
  } else if (typeof dayLabel === "string" && /[<>]/.test(dayLabel)) {
    errors.push("Day label cannot contain < or >.");
  }

  if (
    errors.length === 0 &&
    date &&
    typeof date === "string" &&
    DATE_RE.test(normalizeScheduleDate(date))
  ) {
    const hours = getOpeningHoursForDate(normalizeScheduleDate(date));
    if (!hours) {
      errors.push("Could not resolve opening hours for that date.");
    } else {
      const openM = timeToMinutes(hours.openingTime);
      const closeM = timeToMinutes(hours.closingTime);
      const n = Number(slotDurationMinutes);
      if (Number.isInteger(n) && closeM - openM < n) {
        errors.push(
          "Slot duration must fit within the gym opening hours for that weekday.",
        );
      }
    }
  }

  return errors;
}

function dateStringIsBeforeTodayUtc(dateStr) {
  const t = new Date();
  const y = t.getUTCFullYear();
  const mo = String(t.getUTCMonth() + 1).padStart(2, "0");
  const d = String(t.getUTCDate()).padStart(2, "0");
  const today = `${y}-${mo}-${d}`;
  return dateStr < today;
}

export async function createGymSchedule(req, res) {
  try {
    const errors = validateSchedulePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(" ") });
    }

    const { dayLabel = "", slotDurationMinutes, capacityPerSlot } = req.body;
    const date = normalizeScheduleDate(req.body.date);

    if (dateStringIsBeforeTodayUtc(date)) {
      return res.status(400).json({ message: "Date cannot be in the past." });
    }

    const { openingTime, closingTime } = getOpeningHoursForDate(date);

    let slots;
    try {
      slots = buildSlotsFromWindow(
        openingTime,
        closingTime,
        Number(slotDurationMinutes),
        Number(capacityPerSlot),
      );
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    const existing = await GymSchedule.findOne({ date });
    if (existing) {
      return res.status(409).json({
        code: "DUPLICATE_DATE",
        message:
          "Slots for this date were already generated. Edit or delete the existing schedule, or pick another date.",
      });
    }

    const doc = new GymSchedule({
      date,
      dayLabel: (dayLabel || "").trim(),
      openingTime,
      closingTime,
      slotDurationMinutes: Number(slotDurationMinutes),
      capacityPerSlot: Number(capacityPerSlot),
      slots,
      createdBy: req.user.id,
    });
    await doc.save();
    const populated = await GymSchedule.findById(doc._id).populate(
      "createdBy",
      "name email",
    );
    return res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        code: "DUPLICATE_DATE",
        message:
          "A schedule for this date already exists. Duplicate generation is blocked.",
      });
    }
    console.error(err);
    return res.status(500).json({ message: "Could not save schedule." });
  }
}

export function getGymBookingRules(req, res) {
  return res.json({
    maxBookingsPerDay: MAX_GYM_BOOKINGS_PER_STUDENT_PER_DAY,
    deadlineHoursBeforeSlot: GYM_BOOKING_DEADLINE_HOURS,
    minGapMinutes: GYM_MIN_GAP_MINUTES,
    changeDeadlineMinutes: GYM_CHANGE_DEADLINE_MINUTES,
    noDoubleBooking: true,
    message:
      "No overlapping gym slots; daily limit per student; minimum gap between same-day slots; bookings must be before the deadline if enabled.",
  });
}

function formatUtcYmd(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeSlotKey(slot) {
  const start = slot.startTime || "";
  const end = slot.endTime || "";
  return `${start}-${end}`;
}

export async function getGymSlotAnalytics(req, res) {
  try {
    const days = Math.max(1, parseInt(req.query.days || "7", 10) || 7);
    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const fromYmd = formatUtcYmd(start);
    const toYmd = formatUtcYmd(now);

    // date strings are YYYY-MM-DD, so lex compare works
    const schedules = await GymSchedule.find({
      date: { $gte: fromYmd, $lte: toYmd },
    }).lean();

    const totalsBySlotKey = new Map(); // key => { booked, capacity }
    let totalBooked = 0;
    let totalCapacity = 0;

    // daily usage line chart
    const daily = [];

    for (const sched of schedules) {
      let dayBooked = 0;
      let dayCapacity = 0;

      for (const sl of sched.slots || []) {
        // Utilization analysis ignores admin-closed slots.
        if (sl.isClosed) continue;

        const cap = sl.capacity || 0;
        const booked = sl.bookedCount || 0;
        if (!totalsBySlotKey.has(computeSlotKey(sl))) {
          totalsBySlotKey.set(computeSlotKey(sl), { booked: 0, capacity: 0 });
        }
        const agg = totalsBySlotKey.get(computeSlotKey(sl));
        agg.booked += booked;
        agg.capacity += cap;

        dayBooked += booked;
        dayCapacity += cap;
      }

      totalBooked += dayBooked;
      totalCapacity += dayCapacity;

      daily.push({
        date: sched.date,
        bookedSeats: dayBooked,
        capacitySeats: dayCapacity,
        utilizationPct: dayCapacity > 0 ? Math.round((dayBooked / dayCapacity) * 1000) / 10 : 0,
      });
    }

    daily.sort((a, b) => a.date.localeCompare(b.date));

    const overallUtilizationPct =
      totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 1000) / 10 : 0;

    const slotStats = [];
    for (const [key, agg] of totalsBySlotKey.entries()) {
      if (!agg.capacity) continue;
      const utilizationPct = (agg.booked / agg.capacity) * 100;
      slotStats.push({
        key,
        bookedSeats: agg.booked,
        capacitySeats: agg.capacity,
        utilizationPct: Math.round(utilizationPct * 10) / 10,
      });
    }

    slotStats.sort((a, b) => b.utilizationPct - a.utilizationPct);
    const peak = slotStats[0] || null;
    const low = slotStats.length ? slotStats[slotStats.length - 1] : null;

    const popularSlots = slotStats.slice(0, 5);
    const emptySlots = slotStats.filter((s) => s.bookedSeats === 0).slice(0, 5);

    const leastBusyTime = low
      ? low.key.split("-").join(" to ")
      : "N/A";

    // Heuristic recommendation.
    let bestApproach = "Promote bookings during low-utilization windows and monitor peak utilization.";
    if (overallUtilizationPct >= 80 && peak) {
      bestApproach = `Peak demand detected at ${peak.key.split("-").join(" to ")}. Consider increasing capacity/staffing at peak and encouraging bookings during low times (${leastBusyTime}).`;
    } else if (overallUtilizationPct <= 30 && low) {
      bestApproach = `Overall utilization is low. Push marketing/discounts for ${leastBusyTime} to improve utilization without increasing capacity.`;
    }

    res.json({
      range: { days, from: fromYmd, to: toYmd },
      overallUtilizationPct,
      popularSlots,
      emptySlots,
      peak: peak
        ? {
            key: peak.key,
            utilizationPct: peak.utilizationPct,
            bookedSeats: peak.bookedSeats,
            capacitySeats: peak.capacitySeats,
          }
        : null,
      low: low
        ? {
            key: low.key,
            utilizationPct: low.utilizationPct,
            bookedSeats: low.bookedSeats,
            capacitySeats: low.capacitySeats,
          }
        : null,
      leastBusyTime,
      bestApproach,
      daily,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load gym slot analytics." });
  }
}

export async function getGymSlotRecommendations(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can view recommendations." });
    }

    const days = Math.max(1, parseInt(req.query.days || "14", 10) || 14);
    const limit = Math.max(1, parseInt(req.query.limit || "3", 10) || 3);

    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const fromYmd = formatUtcYmd(start);
    const toYmd = formatUtcYmd(now);

    const schedules = await GymSchedule.find({
      date: { $gte: fromYmd, $lte: toYmd },
    }).lean();

    const totalsBySlotKey = new Map(); // key => { booked, capacity }
    let totalBooked = 0;
    let totalCapacity = 0;

    for (const sched of schedules) {
      for (const sl of sched.slots || []) {
        // Recommendations ignore admin-closed slots.
        if (sl.isClosed) continue;

        const cap = sl.capacity || 0;
        const booked = sl.bookedCount || 0;

        totalBooked += booked;
        totalCapacity += cap;

        if (!totalsBySlotKey.has(computeSlotKey(sl))) {
          totalsBySlotKey.set(computeSlotKey(sl), { booked: 0, capacity: 0 });
        }
        const agg = totalsBySlotKey.get(computeSlotKey(sl));
        agg.booked += booked;
        agg.capacity += cap;
      }
    }

    const slotStats = [];
    for (const [key, agg] of totalsBySlotKey.entries()) {
      if (!agg.capacity) continue;
      const utilizationPct = (agg.booked / agg.capacity) * 100;
      slotStats.push({
        key,
        bookedSeats: agg.booked,
        capacitySeats: agg.capacity,
        utilizationPct: Math.round(utilizationPct * 10) / 10,
      });
    }

    // Least busy => lowest utilization.
    slotStats.sort((a, b) => a.utilizationPct - b.utilizationPct);
    const recommended = slotStats.slice(0, limit);

    const leastBusyTime = recommended[0]
      ? recommended[0].key.split("-").join(" to ")
      : "N/A";

    const overallUtilizationPct =
      totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 1000) / 10 : 0;

    // Heuristic recommendation (mirrors admin analytics, but for student access).
    const sortedByUtilDesc = [...slotStats].sort(
      (a, b) => b.utilizationPct - a.utilizationPct,
    );
    const peak = sortedByUtilDesc[0] || null;
    const low = sortedByUtilDesc[sortedByUtilDesc.length - 1] || null;

    let bestApproach =
      "Promote bookings during low-utilization windows and monitor peak utilization.";
    if (overallUtilizationPct >= 80 && peak) {
      bestApproach = `Peak demand detected at ${peak.key
        .split("-")
        .join(" to ")}. Consider increasing capacity/staffing at peak and encouraging bookings during low times (${leastBusyTime}).`;
    } else if (overallUtilizationPct <= 30 && low) {
      bestApproach = `Overall utilization is low. Push marketing/discounts for ${leastBusyTime} to improve utilization without increasing capacity.`;
    }

    return res.json({
      range: { days, from: fromYmd, to: toYmd },
      recommended,
      leastBusyTime,
      overallUtilizationPct,
      bestApproach,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load recommendations." });
  }
}

function weekdayIndexUtcFromYmd(yyyyMmDd) {
  const parts = String(yyyyMmDd).split("-").map(Number);
  const Y = parts[0];
  const M = parts[1];
  const D = parts[2];
  if (!Y || !M || !D) return 0;
  return new Date(Date.UTC(Y, M - 1, D)).getUTCDay(); // 0=Sun..6=Sat
}

function normalizeSlotKeyFromTimes(startTime, endTime) {
  return `${startTime || ""}-${endTime || ""}`;
}

function crowdLevelLabel(utilizationPct) {
  if (!Number.isFinite(utilizationPct)) return "UNKNOWN";
  if (utilizationPct >= 85) return "HIGH";
  if (utilizationPct >= 55) return "MEDIUM";
  return "LOW";
}

/**
 * PERSONALIZED SLOT RECOMMENDATION (STUDENT VERSION)
 * - Learns preferred time windows from user's past bookings.
 * - Detects weekly patterns (weekday crowd) from recent schedules.
 * - Scores upcoming slots using a lightweight heuristic ("AI-like" scoring).
 */
export async function getPersonalizedGymSlotRecommendations(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can view personalized recommendations." });
    }

    const uid = req.user.id;
    const historyDays = Math.max(7, parseInt(req.query.historyDays || "28", 10) || 28);
    const futureDays = Math.max(1, parseInt(req.query.futureDays || "14", 10) || 14);
    const limit = Math.max(1, parseInt(req.query.limit || "6", 10) || 6);

    const now = new Date();

    // History window (UTC date strings for safe lex compare).
    const histStart = new Date(now);
    histStart.setUTCDate(histStart.getUTCDate() - (historyDays - 1));
    const histFromYmd = formatUtcYmd(histStart);
    const histToYmd = formatUtcYmd(now);

    // Future window (recommend only upcoming slots).
    const futEnd = new Date(now);
    futEnd.setUTCDate(futEnd.getUTCDate() + futureDays);
    const futFromYmd = formatUtcYmd(now);
    const futToYmd = formatUtcYmd(futEnd);

    const [historySchedules, futureSchedules] = await Promise.all([
      GymSchedule.find({ date: { $gte: histFromYmd, $lte: histToYmd } }).lean(),
      GymSchedule.find({ date: { $gte: futFromYmd, $lte: futToYmd } }).lean(),
    ]);

    // ---- 1) Infer preferred time windows from user's booking history ----
    // We build a distribution over slot keys and a coarse hour bucket.
    const prefBySlotKey = new Map(); // key => count
    const prefByHour = new Map(); // hour => count (0..23)
    let totalPastBookings = 0;

    for (const sched of historySchedules) {
      for (const sl of sched.slots || []) {
        const bookings = sl.bookings || [];
        if (!bookings.some((b) => String(b.user) === String(uid))) continue;
        const key = normalizeSlotKeyFromTimes(sl.startTime, sl.endTime);
        prefBySlotKey.set(key, (prefBySlotKey.get(key) || 0) + 1);
        const h = parseInt(String(sl.startTime || "0").split(":")[0] || "0", 10) || 0;
        prefByHour.set(h, (prefByHour.get(h) || 0) + 1);
        totalPastBookings += 1;
      }
    }

    const preferredSlotKeys = [...prefBySlotKey.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);

    const preferredHours = [...prefByHour.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([h]) => h);

    // ---- 2) Weekly pattern detection (weekday crowd) ----
    // For each weekday (Sun..Sat), compute average utilization across open (not admin-closed) slots.
    const weekdayAgg = Array.from({ length: 7 }, () => ({ booked: 0, capacity: 0 }));
    for (const sched of historySchedules) {
      const wd = weekdayIndexUtcFromYmd(sched.date);
      for (const sl of sched.slots || []) {
        if (sl.isClosed) continue;
        weekdayAgg[wd].booked += sl.bookedCount || 0;
        weekdayAgg[wd].capacity += sl.capacity || 0;
      }
    }
    const weekdayUtilPct = weekdayAgg.map((a) =>
      a.capacity > 0 ? (a.booked / a.capacity) * 100 : 0,
    );

    // ---- 3) Score upcoming slots (crowd level + preference + weekday) ----
    const candidates = [];
    for (const sched of futureSchedules) {
      for (const sl of sched.slots || []) {
        const cap = sl.capacity || 0;
        const booked = sl.bookedCount || 0;
        const open = Math.max(0, cap - booked);

        const slotStart = combineDateAndTimeLocal(sched.date, sl.startTime);
        const isPast = Number.isFinite(slotStart.getTime())
          ? slotStart.getTime() <= Date.now()
          : false;
        const isClosed = Boolean(sl.isClosed) || isPast;
        const status = isClosed ? "CLOSED" : booked >= cap ? "FULL" : "AVAILABLE";
        if (status !== "AVAILABLE") continue;

        const utilPct = cap > 0 ? (booked / cap) * 100 : 0;
        const crowdLevel = crowdLevelLabel(utilPct);

        // Preference score (0..1-ish)
        const key = normalizeSlotKeyFromTimes(sl.startTime, sl.endTime);
        const keyCount = prefBySlotKey.get(key) || 0;
        const keyPref = totalPastBookings ? keyCount / totalPastBookings : 0;
        const startHour = parseInt(String(sl.startTime || "0").split(":")[0] || "0", 10) || 0;
        const hourCount = prefByHour.get(startHour) || 0;
        const hourPref = totalPastBookings ? hourCount / totalPastBookings : 0;

        // Weekly pattern score: prefer weekdays that are historically less crowded for this student base.
        const wd = weekdayIndexUtcFromYmd(sched.date);
        const wdUtil = weekdayUtilPct[wd] || 0;
        const weekdayScore = 1 - Math.min(1, wdUtil / 100); // 1 best (low crowd), 0 worst

        // Crowd score: prefer lower utilization.
        const crowdScore = 1 - Math.min(1, utilPct / 100); // 1 best

        // Lightweight "AI-based" blend (tuned to feel sensible).
        // If we have no personal history, lean more on crowd + weekly pattern.
        const hasHistory = totalPastBookings >= 2;
        const wPref = hasHistory ? 0.45 : 0.15;
        const wCrowd = hasHistory ? 0.40 : 0.55;
        const wWeek = 0.15;

        const score =
          wPref * (0.7 * keyPref + 0.3 * hourPref) + wCrowd * crowdScore + wWeek * weekdayScore;

        const reasons = [];
        if (hasHistory && (preferredSlotKeys.includes(key) || preferredHours.includes(startHour))) {
          reasons.push("Matches your usual booking time");
        } else if (!hasHistory) {
          reasons.push("Based on crowd levels and weekly patterns");
        }
        reasons.push(`Crowd level: ${crowdLevel.toLowerCase()}`);
        if (weekdayAgg[wd].capacity > 0) {
          reasons.push(`Weekday trend: ~${Math.round(wdUtil)}% busy on this weekday`);
        }

        candidates.push({
          scheduleId: String(sched._id),
          date: sched.date,
          dayLabel: sched.dayLabel || "",
          startTime: sl.startTime,
          endTime: sl.endTime,
          slotKey: key,
          crowd: {
            utilizationPct: Math.round(utilPct * 10) / 10,
            crowdLevel,
            openSlots: open,
            capacity: cap,
            booked,
          },
          aiScore: Math.round(score * 1000) / 1000,
          reasons,
        });
      }
    }

    candidates.sort((a, b) => b.aiScore - a.aiScore);
    const recommended = candidates.slice(0, limit);

    // Human-readable preference summary.
    const preferredTimeSummary =
      preferredSlotKeys.length > 0
        ? preferredSlotKeys[0].split("-").join(" to ")
        : preferredHours.length > 0
          ? `${String(preferredHours[0]).padStart(2, "0")}:00`
          : "N/A";

    return res.json({
      config: { historyDays, futureDays, limit },
      preferredTime: {
        summary: preferredTimeSummary,
        totalPastBookings,
        topSlotKeys: preferredSlotKeys,
        topStartHours: preferredHours,
      },
      weeklyPattern: weekdayUtilPct.map((v) => Math.round(v * 10) / 10), // Sun..Sat
      recommended,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Could not load personalized recommendations." });
  }
}

export async function bookGymSlot(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can book gym slots." });
    }

    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    if (dateStringIsBeforeTodayUtc(schedule.date)) {
      return res.status(400).json({ message: "Cannot book slots on past dates." });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const uid = req.user.id;
    const list = slot.bookings || [];
    const already = list.some((b) => String(b.user) === String(uid));
    if (already) {
      return res.status(400).json({ message: "You have already booked this slot." });
    }

    const booked = slot.bookedCount || 0;
    if (booked >= slot.capacity) {
      return res.status(400).json({ message: "This slot is full." });
    }

    const ruleErr = await validateTargetSlotForStudent(uid, schedule, slot, {
      skipDailyLimit: false,
      excludeSlotIds: [],
      scheduleDoc: schedule,
    });
    if (ruleErr) {
      return res.status(400).json({ message: ruleErr });
    }

    // If the user was previously in the waitlist for this slot, remove that entry.
    slot.waitlist = (slot.waitlist || []).filter(
      (w) => String(w.user) !== String(uid),
    );

    slot.bookings = list;
    slot.bookings.push({ user: uid });
    slot.bookedCount = booked + 1;
    await schedule.save();

    await createGymNotificationOnce(
      uid,
      `Booking confirmed: gym slot ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      { kind: "BOOKING_CONFIRMED", ref: `${String(schedule._id)}:${String(slot._id)}` },
    );

    return res.status(200).json({ message: "Slot booked successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not complete booking." });
  }
}

export async function joinGymSlotWaitlist(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can join waitlists." });
    }

    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    if (dateStringIsBeforeTodayUtc(schedule.date)) {
      return res.status(400).json({ message: "Cannot join waitlist on past dates." });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const uid = req.user.id;
    const bookings = slot.bookings || [];
    if (bookings.some((b) => String(b.user) === String(uid))) {
      return res.status(400).json({ message: "You already booked this slot." });
    }

    if (slot.isClosed || isSlotInPast(schedule.date, slot.startTime)) {
      return res.status(400).json({ message: "Slot is closed." });
    }

    // Only allow waitlist when slot is full.
    const booked = slot.bookedCount || 0;
    if (booked < slot.capacity) {
      return res.status(400).json({ message: "Slot has availability. Book directly instead." });
    }

    const waitlist = slot.waitlist || [];
    if (waitlist.some((w) => String(w.user) === String(uid))) {
      return res.status(400).json({ message: "You are already on the waitlist for this slot." });
    }

    // Ensure the student would be eligible when/if promoted.
    const ruleErr = await validateTargetSlotForStudent(uid, schedule, slot, {
      skipDailyLimit: false,
      excludeSlotIds: [],
      scheduleDoc: schedule,
    });
    if (ruleErr) {
      return res.status(400).json({ message: ruleErr });
    }

    slot.waitlist = waitlist;
    slot.waitlist.push({ user: uid });
    await createGymNotificationOnce(
      uid,
      `Waitlist: you joined for gym slot ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      { kind: "WAITLIST_JOINED", ref: `${String(schedule._id)}:${String(slot._id)}` },
    );

    await schedule.save();
    return res.status(200).json({ message: "Added to waitlist." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not join waitlist." });
  }
}

export async function cancelGymSlotWaitlist(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can cancel waitlists." });
    }

    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const uid = req.user.id;
    const before = (slot.waitlist || []).length;
    slot.waitlist = (slot.waitlist || []).filter(
      (w) => String(w.user) !== String(uid),
    );
    const after = slot.waitlist.length;

    if (before === after) {
      return res.status(404).json({ message: "You are not on the waitlist for this slot." });
    }

    await schedule.save();
    await createGymNotification(
      uid,
      `Waitlist cancelled: gym slot ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      { kind: "WAITLIST_CANCELLED", ref: `${String(schedule._id)}:${String(slot._id)}:${String(Date.now())}` },
    );
    return res.json({ message: "Removed from waitlist." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not cancel waitlist." });
  }
}

export async function adminCloseGymSlot(req, res) {
  try {
    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: "Schedule not found." });

    const slot = schedule.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    slot.isClosed = true;
    slot.closedAt = new Date();
    slot.closedBy = req.user.id;
    await schedule.save();

    return res.json({ message: "Slot closed." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not close slot." });
  }
}

export async function adminOpenGymSlot(req, res) {
  try {
    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: "Schedule not found." });

    const slot = schedule.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    slot.isClosed = false;
    slot.closedAt = null;
    slot.closedBy = null;
    await schedule.save();

    return res.json({ message: "Slot reopened." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not reopen slot." });
  }
}

export async function adminSetGymSlotCapacity(req, res) {
  try {
    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const nextCap = Number(req.body?.capacity);
    if (!Number.isFinite(nextCap) || !Number.isInteger(nextCap)) {
      return res.status(400).json({ message: "Capacity must be a whole number." });
    }
    if (nextCap < 1 || nextCap > 10) {
      return res.status(400).json({ message: "Capacity must be between 1 and 10." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: "Schedule not found." });

    const slot = schedule.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    const booked = slot.bookedCount || 0;
    if (nextCap < booked) {
      return res.status(400).json({
        message: `Capacity cannot be lower than current bookings (${booked}).`,
      });
    }

    slot.capacity = nextCap;
    await schedule.save();
    return res.json({ message: "Slot capacity updated.", capacity: slot.capacity });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not update slot capacity." });
  }
}

export async function listMyGymSlotWaitlists(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can view waitlists." });
    }

    const uid = req.user.id;
    const schedules = await GymSchedule.find({ "slots.waitlist.user": uid })
      .sort({ date: 1, openingTime: 1 })
      .lean();

    const out = [];
    for (const s of schedules) {
      for (const sl of s.slots || []) {
        const mine = (sl.waitlist || []).find((w) => String(w.user) === String(uid));
        if (mine) {
          out.push({
            scheduleId: s._id,
            slotId: sl._id,
            date: s.date,
            dayLabel: s.dayLabel || "",
            startTime: sl.startTime,
            endTime: sl.endTime,
            joinedAt: mine.joinedAt,
          });
        }
      }
    }

    out.sort((a, b) => {
      const c = a.date.localeCompare(b.date);
      if (c !== 0) return c;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load your waitlists." });
  }
}

export async function listMyGymSlotBookings(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can view gym slot bookings." });
    }
    const uid = req.user.id;
    const schedules = await GymSchedule.find({ "slots.bookings.user": uid })
      .sort({ date: 1, openingTime: 1 })
      .lean();

    const out = [];
    for (const s of schedules) {
      for (const sl of s.slots || []) {
        const mine = (sl.bookings || []).find((b) => String(b.user) === String(uid));
        if (mine) {
          out.push({
            scheduleId: s._id,
            slotId: sl._id,
            date: s.date,
            dayLabel: s.dayLabel || "",
            startTime: sl.startTime,
            endTime: sl.endTime,
            bookedAt: mine.bookedAt,
          });
        }
      }
    }

    out.sort((a, b) => {
      const c = a.date.localeCompare(b.date);
      if (c !== 0) return c;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load your gym bookings." });
  }
}

export async function listMyGymNotifications(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can view notifications." });
    }

    const uid = req.user.id;

    // Reminder before session (generated on-demand; frontend already polls).
    const reminderMinutes = Math.max(
      0,
      parseInt(process.env.GYM_REMINDER_MINUTES || "120", 10) || 120,
    );
    if (reminderMinutes > 0) {
      const now = new Date();
      const windowEnd = new Date(now.getTime() + reminderMinutes * 60000);
      const fromYmd = formatUtcYmd(now);
      const toYmd = formatUtcYmd(windowEnd);
      const schedules = await GymSchedule.find({
        date: { $gte: fromYmd, $lte: toYmd },
        "slots.bookings.user": uid,
      }).lean();

      for (const s of schedules) {
        for (const sl of s.slots || []) {
          if (!(sl.bookings || []).some((b) => String(b.user) === String(uid))) continue;
          const start = combineDateAndTimeLocal(s.date, sl.startTime);
          if (!Number.isFinite(start.getTime())) continue;
          if (start.getTime() <= now.getTime()) continue;
          if (start.getTime() > windowEnd.getTime()) continue;
          await createGymNotificationOnce(
            uid,
            `Reminder: your gym slot starts soon — ${formatSlotNotification(
              s.date,
              s.dayLabel,
              sl.startTime,
              sl.endTime,
            )}.`,
            { kind: "REMINDER_BEFORE_SESSION", ref: `${String(s._id)}:${String(sl._id)}` },
          );
        }
      }
    }

    const includeRead =
      String(req.query.includeRead || "").toLowerCase() === "true" ||
      String(req.query.includeRead || "") === "1";

    const kindsRaw = String(req.query.kinds || req.query.kind || "").trim();
    const kinds = kindsRaw
      ? kindsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const q = { user: uid };
    if (!includeRead) q.isRead = false;
    if (kinds.length) q.kind = { $in: kinds };

    const list = await GymNotification.find(q)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json(
      (list || []).map((n) => ({
        _id: n._id,
        message: n.message,
        type: n.type,
        kind: n.kind || "",
        ref: n.ref || "",
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load notifications." });
  }
}

export async function markMyGymNotificationRead(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can update notifications." });
    }

    const { notificationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: "Invalid notification id." });
    }

    const updated = await GymNotification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.json({ message: "Notification marked as read." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not mark as read." });
  }
}

export async function cancelGymSlotBooking(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can cancel gym slots." });
    }
    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }
    if (dateStringIsBeforeTodayUtc(schedule.date)) {
      return res.status(400).json({ message: "Cannot cancel a booking on a past date." });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const changeDeadlineMsg = assertChangeDeadlineOrMessage(
      schedule.date,
      slot.startTime,
      "cancel",
    );
    if (changeDeadlineMsg) {
      return res.status(400).json({ message: changeDeadlineMsg });
    }

    const uid = req.user.id;
    const list = slot.bookings || [];
    const idx = list.findIndex((b) => String(b.user) === String(uid));
    if (idx === -1) {
      return res.status(404).json({ message: "You do not have a booking in this slot." });
    }

    list.splice(idx, 1);
    slot.bookings = list;
    slot.bookedCount = Math.max(0, (slot.bookedCount || 0) - 1);
    // Auto promotion: if someone is waiting for this slot and the gym becomes available,
    // promote them in FIFO order.
    await autoPromoteWaitlist(schedule, slot);

    await schedule.save();

    await createGymNotification(
      uid,
      `Booking cancelled: gym slot ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      { kind: "BOOKING_CANCELLED", ref: `${String(schedule._id)}:${String(slot._id)}:${String(Date.now())}` },
    );

    return res.json({ message: "Gym slot booking cancelled." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not cancel booking." });
  }
}

export async function moveGymSlotBooking(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can update gym slots." });
    }

    const { scheduleId, slotId } = req.params;
    const { targetScheduleId, targetSlotId } = req.body || {};

    if (!targetScheduleId || !targetSlotId) {
      return res.status(400).json({
        message: "Provide targetScheduleId and targetSlotId to move your booking.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId) ||
      !mongoose.Types.ObjectId.isValid(targetScheduleId) ||
      !mongoose.Types.ObjectId.isValid(targetSlotId)
    ) {
      return res.status(400).json({ message: "Invalid id(s)." });
    }

    if (String(scheduleId) === String(targetScheduleId) && String(slotId) === String(targetSlotId)) {
      return res.status(400).json({ message: "Choose a different slot to move to." });
    }

    const uid = req.user.id;

    const applyMove = (fromSched, fromSl, toSched, toSl) => {
      const fromList = fromSl.bookings || [];
      const bi = fromList.findIndex((b) => String(b.user) === String(uid));
      if (bi === -1) return { error: "You do not have a booking in this slot." };

      const toList = toSl.bookings || [];
      if (toList.some((b) => String(b.user) === String(uid))) {
        return { error: "You already have a booking in the target slot." };
      }
      const booked = toSl.bookedCount || 0;
      if (booked >= toSl.capacity) {
        return { error: "Target slot is full." };
      }

      const [removed] = fromList.splice(bi, 1);
      fromSl.bookings = fromList;
      fromSl.bookedCount = Math.max(0, (fromSl.bookedCount || 0) - 1);

      toSl.bookings = toList;
      toSl.bookings.push({
        user: uid,
        bookedAt: removed.bookedAt || new Date(),
      });
      toSl.bookedCount = booked + 1;
      return null;
    };

    if (String(scheduleId) === String(targetScheduleId)) {
      const schedule = await GymSchedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found." });
      }
      if (dateStringIsBeforeTodayUtc(schedule.date)) {
        return res.status(400).json({ message: "Cannot change a booking on a past date." });
      }

      const fromSlot = schedule.slots.id(slotId);
      const toSlot = schedule.slots.id(targetSlotId);
      if (!fromSlot || !toSlot) {
        return res.status(404).json({ message: "Slot not found." });
      }

      const fromDeadlineMsg = assertChangeDeadlineOrMessage(
        schedule.date,
        fromSlot.startTime,
        "change",
      );
      if (fromDeadlineMsg) {
        return res.status(400).json({ message: fromDeadlineMsg });
      }
      const toDeadlineMsg = assertChangeDeadlineOrMessage(
        schedule.date,
        toSlot.startTime,
        "change",
      );
      if (toDeadlineMsg) {
        return res.status(400).json({ message: toDeadlineMsg });
      }

      const ruleErr = await validateTargetSlotForStudent(uid, schedule, toSlot, {
        skipDailyLimit: true,
        excludeSlotIds: [fromSlot._id],
        scheduleDoc: schedule,
      });
      if (ruleErr) {
        return res.status(400).json({ message: ruleErr });
      }

      const errMsg = applyMove(schedule, fromSlot, schedule, toSlot);
      if (errMsg) {
        const status = errMsg.error.includes("do not have") ? 404 : 400;
        return res.status(status).json({ message: errMsg.error });
      }

      // Freed one seat in `fromSlot`, so promote from its waitlist if available.
      await autoPromoteWaitlist(schedule, fromSlot);
      await schedule.save();
      await createGymNotification(
        uid,
        `Booking updated: moved from ${formatSlotNotification(
          schedule.date,
          schedule.dayLabel,
          fromSlot.startTime,
          fromSlot.endTime,
        )} to ${formatSlotNotification(
          schedule.date,
          schedule.dayLabel,
          toSlot.startTime,
          toSlot.endTime,
        )}.`,
        {
          kind: "BOOKING_MOVED",
          ref: `${String(schedule._id)}:${String(fromSlot._id)}:${String(toSlot._id)}:${String(Date.now())}`,
        },
      );
      return res.json({ message: "Booking moved to the new slot." });
    }

    const fromSched = await GymSchedule.findById(scheduleId);
    const toSched = await GymSchedule.findById(targetScheduleId);
    if (!fromSched || !toSched) {
      return res.status(404).json({ message: "Schedule not found." });
    }
    if (dateStringIsBeforeTodayUtc(fromSched.date)) {
      return res.status(400).json({ message: "Cannot change a booking on a past date." });
    }
    if (dateStringIsBeforeTodayUtc(toSched.date)) {
      return res.status(400).json({ message: "Cannot move to a past date." });
    }

    const fromSlot = fromSched.slots.id(slotId);
    const toSlot = toSched.slots.id(targetSlotId);
    if (!fromSlot || !toSlot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const fromDeadlineMsg = assertChangeDeadlineOrMessage(
      fromSched.date,
      fromSlot.startTime,
      "change",
    );
    if (fromDeadlineMsg) {
      return res.status(400).json({ message: fromDeadlineMsg });
    }
    const toDeadlineMsg = assertChangeDeadlineOrMessage(
      toSched.date,
      toSlot.startTime,
      "change",
    );
    if (toDeadlineMsg) {
      return res.status(400).json({ message: toDeadlineMsg });
    }

    const ruleErr = await validateTargetSlotForStudent(uid, toSched, toSlot, {
      skipDailyLimit: false,
      excludeSlotIds: [],
      scheduleDoc: toSched,
    });
    if (ruleErr) {
      return res.status(400).json({ message: ruleErr });
    }

    const errMsg = applyMove(fromSched, fromSlot, toSched, toSlot);
    if (errMsg) {
      const status = errMsg.error.includes("do not have") ? 404 : 400;
      return res.status(status).json({ message: errMsg.error });
    }

    // Freed one seat in `fromSlot`, so promote from its waitlist if available.
    await autoPromoteWaitlist(fromSched, fromSlot);

    await fromSched.save();
    await toSched.save();
    await createGymNotification(
      uid,
      `Booking updated: moved from ${formatSlotNotification(
        fromSched.date,
        fromSched.dayLabel,
        fromSlot.startTime,
        fromSlot.endTime,
      )} to ${formatSlotNotification(
        toSched.date,
        toSched.dayLabel,
        toSlot.startTime,
        toSlot.endTime,
      )}.`,
      {
        kind: "BOOKING_MOVED",
        ref: `${String(fromSched._id)}:${String(fromSlot._id)}:${String(toSched._id)}:${String(toSlot._id)}:${String(Date.now())}`,
      },
    );
    return res.json({ message: "Booking moved to the new slot." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not update booking." });
  }
}

export async function listGymSchedules(req, res) {
  try {
    const list = await GymSchedule.find()
      .sort({ date: 1, openingTime: 1 })
      .populate("createdBy", "name email");
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load schedules." });
  }
}

export async function updateGymSchedule(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid schedule id." });
    }

    const schedule = await GymSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    const booked = schedule.slots.some((s) => (s.bookedCount || 0) > 0);
    if (booked) {
      return res.status(400).json({
        message: "Cannot change this schedule while slots have bookings.",
      });
    }

    const errors = validateSchedulePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(" ") });
    }

    const { dayLabel = "", slotDurationMinutes, capacityPerSlot } = req.body;
    const date = normalizeScheduleDate(req.body.date);

    const { openingTime, closingTime } = getOpeningHoursForDate(date);

    let slots;
    try {
      slots = buildSlotsFromWindow(
        openingTime,
        closingTime,
        Number(slotDurationMinutes),
        Number(capacityPerSlot),
      );
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    const dup = await GymSchedule.findOne({ _id: { $ne: id }, date });
    if (dup) {
      return res.status(409).json({
        code: "DUPLICATE_DATE",
        message:
          "Another schedule already uses this date. Choose a different date or update that entry instead.",
      });
    }

    schedule.date = date;
    schedule.dayLabel = (dayLabel || "").trim();
    schedule.openingTime = openingTime;
    schedule.closingTime = closingTime;
    schedule.slotDurationMinutes = Number(slotDurationMinutes);
    schedule.capacityPerSlot = Number(capacityPerSlot);
    schedule.slots = slots;
    await schedule.save();

    const populated = await GymSchedule.findById(schedule._id).populate(
      "createdBy",
      "name email",
    );
    return res.json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        code: "DUPLICATE_DATE",
        message: "A schedule for this date already exists. Duplicate generation is blocked.",
      });
    }
    console.error(err);
    return res.status(500).json({ message: "Could not update schedule." });
  }
}

export async function deleteGymSchedule(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid schedule id." });
    }
    const schedule = await GymSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }
    await GymSchedule.deleteOne({ _id: id });
    return res.json({ message: "Schedule removed." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete schedule." });
  }
}
