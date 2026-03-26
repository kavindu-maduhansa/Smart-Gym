import mongoose from "mongoose";
import GymSchedule from "../models/GymSchedule.js";
import GymNotification from "../models/GymNotification.js";
import User from "../models/User.js";
import { getOpeningHoursForDate } from "../utils/gymOpeningHours.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HM_RE = /^\d{2}:\d{2}$/;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function isSlotInPast(scheduleDate, startTime) {
  const slotStart = combineDateAndTimeLocal(scheduleDate, startTime);
  return Date.now() >= slotStart.getTime();
}

/**
 * Auto-disable: past slots and fully booked slots get isClosed (unless an admin closed/open
 * explicitly — tracked by closedBy). When seats free up or the slot is in the future again,
 * non-admin slots reopen automatically.
 * @returns {boolean} true if this slot document was modified
 */
function applyGymSlotAutoDisable(schedule, slot) {
  if (!slot || slot.closedBy) {
    return false;
  }

  const past = isSlotInPast(schedule.date, slot.startTime);
  const full =
    Number(slot.bookedCount || 0) >= Number(slot.capacity || 0);
  let changed = false;

  if (past) {
    if (!slot.isClosed) {
      slot.isClosed = true;
      slot.closedAt = new Date();
      changed = true;
    }
  } else if (full) {
    if (!slot.isClosed) {
      slot.isClosed = true;
      slot.closedAt = new Date();
      changed = true;
    }
  } else if (slot.isClosed) {
    slot.isClosed = false;
    slot.closedAt = null;
    changed = true;
  }

  return changed;
}

/** @returns {boolean} true if any slot on the schedule was modified */
function syncGymSlotsAutoDisableSchedule(schedule) {
  if (!schedule?.slots?.length) return false;
  let changed = false;
  for (const slot of schedule.slots) {
    if (applyGymSlotAutoDisable(schedule, slot)) {
      changed = true;
    }
  }
  return changed;
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

/**
 * Authoritative checks before gym book / waitlist (promotion) / move: DB role, block flag, membership expiry.
 */
async function assertStudentEligibleForGymBooking(userId) {
  const user = await User.findById(userId).select("role isBlocked membershipExpiry");
  if (!user) {
    return "We could not verify your account. Please sign in again.";
  }
  if (user.isBlocked) {
    return "Your account is blocked. Contact the gym for assistance.";
  }
  if (user.role !== "student") {
    return "Only student memberships can book gym floor slots.";
  }
  const expMs = user.membershipExpiry ? new Date(user.membershipExpiry).getTime() : NaN;
  if (!Number.isFinite(expMs) || expMs < Date.now()) {
    return "Active membership is required. Renew your membership to book gym slots.";
  }
  return null;
}

async function validateTargetSlotForStudent(userId, toSched, toSlot, options = {}) {
  const {
    skipDailyLimit = false,
    excludeSlotIds = [],
    scheduleDoc = null,
    allowFullSlot = false,
  } = options;

  const accountMsg = await assertStudentEligibleForGymBooking(userId);
  if (accountMsg) return accountMsg;

  const deadlineMsg = assertBookingDeadlineOrMessage(toSched.date, toSlot.startTime);
  if (deadlineMsg) return deadlineMsg;

  if (isSlotInPast(toSched.date, toSlot.startTime)) {
    return "Slot is closed.";
  }
  if (toSlot?.closedBy) {
    return "This slot is closed by staff.";
  }
  if (!allowFullSlot) {
    const cap = toSlot?.capacity || 0;
    const booked = toSlot?.bookedCount || 0;
    if (booked >= cap) {
      return "This slot is full.";
    }
  }

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

async function createGymNotification(
  userId,
  message,
  type = "gym",
  category = "general",
) {
  await GymNotification.create({ user: userId, message, type, category });
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
    slot.bookings.push({
      user: candidateId,
      bookedAt: new Date(),
      reminderSentAt: null,
    });
    slot.bookedCount = (slot.bookedCount || 0) + 1;

    await createGymNotification(
      candidateId,
      `Waitlist promotion — you have been booked for gym slot ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      "gym",
      "waitlist_promotion",
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
    } else if (c < 1 || c > 500) {
      errors.push("Capacity must be between 1 and 500.");
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
    const n = Number(slotDurationMinutes);
    const useSpecial =
      body.useSpecialHours === true ||
      body.useSpecialHours === "true" ||
      body.useSpecialHours === 1;

    if (useSpecial) {
      const so = String(body.specialOpeningTime ?? "").trim();
      const sc = String(body.specialClosingTime ?? "").trim();
      if (!HM_RE.test(so)) errors.push("Special opening time must be HH:MM (24h).");
      if (!HM_RE.test(sc)) errors.push("Special closing time must be HH:MM (24h).");
      if (errors.length === 0) {
        const openM = timeToMinutes(so);
        const closeM = timeToMinutes(sc);
        if (closeM <= openM) {
          errors.push("Special closing time must be after opening (same day).");
        } else if (Number.isInteger(n) && closeM - openM < n) {
          errors.push(
            "Special hours must be wide enough for at least one 120-minute slot.",
          );
        }
      }
    } else {
      const hours = getOpeningHoursForDate(normalizeScheduleDate(date));
      if (!hours) {
        errors.push("Could not resolve opening hours for that date.");
      } else {
        const openM = timeToMinutes(hours.openingTime);
        const closeM = timeToMinutes(hours.closingTime);
        if (Number.isInteger(n) && closeM - openM < n) {
          errors.push(
            "Slot duration must fit within the gym opening hours for that weekday.",
          );
        }
      }
    }
  }

  return errors;
}

function resolveScheduleWindowTimes(body, dateYmd) {
  const useSpecial =
    body.useSpecialHours === true ||
    body.useSpecialHours === "true" ||
    body.useSpecialHours === 1;
  if (useSpecial) {
    return {
      useSpecialHours: true,
      openingTime: String(body.specialOpeningTime ?? "").trim(),
      closingTime: String(body.specialClosingTime ?? "").trim(),
    };
  }
  const hours = getOpeningHoursForDate(dateYmd);
  return {
    useSpecialHours: false,
    openingTime: hours.openingTime,
    closingTime: hours.closingTime,
  };
}

/** Matches admin `YYYY-MM-DD` strings and `combineDateAndTimeLocal` (server local calendar). */
function dateStringIsBeforeTodayLocal(dateStr) {
  const t = new Date();
  const y = t.getFullYear();
  const mo = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
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

    if (dateStringIsBeforeTodayLocal(date)) {
      return res.status(400).json({ message: "Date cannot be in the past." });
    }

    const window = resolveScheduleWindowTimes(req.body, date);
    const { openingTime, closingTime } = window;

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
      useSpecialHours: Boolean(window.useSpecialHours),
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
    noDoubleBooking: true,
    membershipRequired: true,
    activeMembershipChecks: [
      "Student role and non-blocked account (verified on each booking).",
      "membershipExpiry must be in the future.",
    ],
    availabilityChecks: [
      "Slot must exist, not be staff-closed, not in the past, and have free capacity (waitlist is separate).",
    ],
    message:
      "No overlapping gym slots; daily limit per student; minimum gap between same-day slots; bookings must be before the deadline if enabled. Active membership and account status are verified on the server before every book or waitlist join.",
  });
}

/** Calendar Y-M-D in the server local timezone (same basis as slot times via combineDateAndTimeLocal). */
function formatLocalYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Inclusive range [fromYmd, toYmd] for the last `numDays` local calendar days ending today. */
function localRollingRangeEndingToday(now, numDays) {
  const end = startOfLocalDay(now);
  const start = new Date(end);
  start.setDate(start.getDate() - (numDays - 1));
  return {
    fromYmd: formatLocalYmd(start),
    toYmd: formatLocalYmd(end),
    todayYmd: formatLocalYmd(end),
  };
}

function computeSlotKey(slot) {
  const start = slot.startTime || "";
  const end = slot.endTime || "";
  return `${start}-${end}`;
}

function parseHmToMinutes(hm) {
  if (!hm || !HM_RE.test(hm)) return 0;
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function utcWeekdayIndex(ymd) {
  const parts = String(ymd).split("-").map(Number);
  const y = parts[0];
  const M = parts[1];
  const d = parts[2];
  if (!y || !M || !d) return 0;
  return new Date(Date.UTC(y, M - 1, d)).getUTCDay();
}

function slotMidpointMinutes(startTime, endTime) {
  const a = timeToMinutes(startTime);
  const b = timeToMinutes(endTime);
  return Math.round((a + b) / 2);
}

function crowdBandFromPct(pct) {
  if (pct < 36) return "low";
  if (pct < 72) return "medium";
  return "high";
}

export async function getMyGymSlotPreferences(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can view slot preferences." });
    }
    const user = await User.findById(req.user.id).select(
      "preferredGymTimeFrom preferredGymTimeTo preferLowCrowdGym",
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({
      preferredGymTimeFrom: user.preferredGymTimeFrom || "",
      preferredGymTimeTo: user.preferredGymTimeTo || "",
      preferLowCrowdGym: user.preferLowCrowdGym !== false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load preferences." });
  }
}

export async function updateMyGymSlotPreferences(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can update slot preferences." });
    }
    const { preferredGymTimeFrom, preferredGymTimeTo, preferLowCrowdGym } = req.body || {};

    let fromVal;
    if (preferredGymTimeFrom !== undefined) {
      fromVal = String(preferredGymTimeFrom).trim();
      if (fromVal !== "" && !HM_RE.test(fromVal)) {
        return res.status(400).json({ message: "Preferred start time must be HH:MM (24h)." });
      }
    }

    let toVal;
    if (preferredGymTimeTo !== undefined) {
      toVal = String(preferredGymTimeTo).trim();
      if (toVal !== "" && !HM_RE.test(toVal)) {
        return res.status(400).json({ message: "Preferred end time must be HH:MM (24h)." });
      }
    }

    if (
      fromVal !== undefined &&
      toVal !== undefined &&
      fromVal &&
      toVal &&
      parseHmToMinutes(fromVal) >= parseHmToMinutes(toVal)
    ) {
      return res.status(400).json({
        message: "Preferred start must be before end (same calendar day).",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (fromVal !== undefined) user.preferredGymTimeFrom = fromVal;
    if (toVal !== undefined) user.preferredGymTimeTo = toVal;
    if (typeof preferLowCrowdGym === "boolean") user.preferLowCrowdGym = preferLowCrowdGym;

    await user.save();

    return res.json({
      preferredGymTimeFrom: user.preferredGymTimeFrom || "",
      preferredGymTimeTo: user.preferredGymTimeTo || "",
      preferLowCrowdGym: user.preferLowCrowdGym !== false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not save preferences." });
  }
}

export async function getGymSlotAnalytics(req, res) {
  try {
    const days = Math.max(1, parseInt(req.query.days || "7", 10) || 7);
    const popularLimit = Math.min(50, Math.max(1, parseInt(req.query.popularLimit || "12", 10) || 12));
    const emptyLimit = Math.min(50, Math.max(1, parseInt(req.query.emptyLimit || "20", 10) || 20));
    const now = new Date();
    const { fromYmd, toYmd, todayYmd } = localRollingRangeEndingToday(now, days);

    // date strings are YYYY-MM-DD, so lex compare works
    const schedules = await GymSchedule.find({
      date: { $gte: fromYmd, $lte: toYmd },
    }).lean();

    const totalsBySlotKey = new Map(); // key => { booked, capacity }
    let totalBooked = 0;
    let totalCapacity = 0;

    /** @type {Array<{ scheduleId: string, slotId: string, date: string, dayLabel: string, startTime: string, endTime: string, bookedCount: number, capacity: number, utilizationPct: number, isPast: boolean }>} */
    const slotInstances = [];

    // daily usage line chart
    const daily = [];

    for (const sched of schedules) {
      let dayBooked = 0;
      let dayCapacity = 0;

      for (const sl of sched.slots || []) {
        // Utilization ignores admin-closed slots only (full/auto-closed slots still count).
        if (sl.closedBy) continue;

        const cap = sl.capacity || 0;
        const booked = sl.bookedCount || 0;
        const past = isSlotInPast(sched.date, sl.startTime);
        const utilPct = cap > 0 ? Math.round((booked / cap) * 1000) / 10 : 0;

        slotInstances.push({
          scheduleId: String(sched._id),
          slotId: String(sl._id),
          date: sched.date,
          dayLabel: sched.dayLabel || "",
          startTime: sl.startTime,
          endTime: sl.endTime,
          bookedCount: booked,
          capacity: cap,
          utilizationPct: utilPct,
          isPast: past,
        });

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

    const leastBusyTime = low
      ? low.key.split("-").join(" to ")
      : "N/A";

    const popularSlots = [...slotInstances]
      .filter((s) => s.capacity > 0 && s.bookedCount > 0)
      .sort((a, b) => {
        if (b.utilizationPct !== a.utilizationPct) return b.utilizationPct - a.utilizationPct;
        if (b.bookedCount !== a.bookedCount) return b.bookedCount - a.bookedCount;
        return String(b.date).localeCompare(String(a.date));
      })
      .slice(0, popularLimit);

    const emptySlots = slotInstances
      .filter(
        (s) =>
          s.capacity > 0 &&
          s.bookedCount === 0 &&
          !s.isPast &&
          String(s.date) >= todayYmd,
      )
      .sort((a, b) => {
        const dc = String(a.date).localeCompare(String(b.date));
        if (dc !== 0) return dc;
        return String(a.startTime).localeCompare(String(b.startTime));
      })
      .slice(0, emptyLimit);

    const emptySlotCount = slotInstances.filter(
      (s) =>
        s.capacity > 0 &&
        s.bookedCount === 0 &&
        !s.isPast &&
        String(s.date) >= todayYmd,
    ).length;

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
      totals: {
        bookedSeats: totalBooked,
        capacitySeats: totalCapacity,
      },
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
      popularSlots,
      emptySlots,
      emptySlotCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load gym slot analytics." });
  }
}

/**
 * Same data as GET /recommendations (for students). Used by AI chat context without HTTP.
 */
export async function buildStudentGymRecommendationPayload(userId, query = {}) {
  const days = Math.max(1, parseInt(query.days || "14", 10) || 14);
  const limit = Math.max(1, parseInt(query.limit || "3", 10) || 3);
  const horizonDays = Math.min(60, Math.max(1, parseInt(query.horizonDays || "21", 10) || 21));
  const personalizedLimit = Math.min(
    20,
    Math.max(limit, parseInt(query.personalizedLimit || "8", 10) || 8),
  );

    const profile = await User.findById(userId)
      .select("preferredGymTimeFrom preferredGymTimeTo preferLowCrowdGym")
      .lean();

    const prefs = {
      preferredGymTimeFrom: profile?.preferredGymTimeFrom || "",
      preferredGymTimeTo: profile?.preferredGymTimeTo || "",
      preferLowCrowdGym: profile?.preferLowCrowdGym !== false,
    };

    const now = new Date();
    const { fromYmd, toYmd, todayYmd } = localRollingRangeEndingToday(now, days);

    const schedules = await GymSchedule.find({
      date: { $gte: fromYmd, $lte: toYmd },
    }).lean();

    const totalsBySlotKey = new Map();
    let totalBooked = 0;
    let totalCapacity = 0;
    const wdBooked = Array(7).fill(0);
    const wdCap = Array(7).fill(0);

    for (const sched of schedules) {
      const wd = utcWeekdayIndex(sched.date);
      for (const sl of sched.slots || []) {
        if (sl.isClosed) continue;

        const cap = sl.capacity || 0;
        const booked = sl.bookedCount || 0;

        totalBooked += booked;
        totalCapacity += cap;
        wdBooked[wd] += booked;
        wdCap[wd] += cap;

        const k = computeSlotKey(sl);
        if (!totalsBySlotKey.has(k)) {
          totalsBySlotKey.set(k, { booked: 0, capacity: 0 });
        }
        const agg = totalsBySlotKey.get(k);
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

    slotStats.sort((a, b) => a.utilizationPct - b.utilizationPct);
    const recommended = slotStats.slice(0, limit);

    const leastBusyTime = recommended[0]
      ? recommended[0].key.split("-").join(" to ")
      : "N/A";

    const overallUtilizationPct =
      totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 1000) / 10 : 0;

    const sortedByUtilDesc = [...slotStats].sort((a, b) => b.utilizationPct - a.utilizationPct);
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

    const globalBusyWeekdays = wdCap
      .map((cap, i) => ({
        weekday: i,
        label: WEEKDAY_LABELS[i],
        avgUtilizationPct: cap > 0 ? Math.round((wdBooked[i] / cap) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.avgUtilizationPct - a.avgUtilizationPct);

    const historyForUser = await GymSchedule.find({
      date: { $lt: todayYmd },
      "slots.bookings.user": userId,
    })
      .select("date slots")
      .lean()
      .limit(400);

    const userWeekdayCounts = Array(7).fill(0);
    const userSlotKeyCounts = new Map();
    for (const sched of historyForUser) {
      for (const sl of sched.slots || []) {
        const mine = (sl.bookings || []).some((b) => String(b.user) === String(userId));
        if (!mine) continue;
        userWeekdayCounts[utcWeekdayIndex(sched.date)] += 1;
        const k = computeSlotKey(sl);
        userSlotKeyCounts.set(k, (userSlotKeyCounts.get(k) || 0) + 1);
      }
    }

    const userWeekdayPattern = userWeekdayCounts
      .map((bookingCount, weekday) => ({
        weekday,
        label: WEEKDAY_LABELS[weekday],
        bookingCount,
      }))
      .filter((x) => x.bookingCount > 0)
      .sort((a, b) => b.bookingCount - a.bookingCount);

    const userSlotKeySorted = [...userSlotKeyCounts.entries()].sort((a, b) => b[1] - a[1]);

    let weeklyDetectedSummary =
      "Not enough history yet to detect your personal weekly pattern; rankings use gym-wide trends and your preferences.";
    const topDay = userWeekdayPattern[0];
    const topSlotEntry = userSlotKeySorted[0];
    if (topDay && topDay.bookingCount > 0) {
      weeklyDetectedSummary = `You most often train on ${topDay.label}s (${topDay.bookingCount} past bookings).`;
      if (topSlotEntry) {
        weeklyDetectedSummary += ` A recurring time block for you is ${topSlotEntry[0]
          .split("-")
          .join(" to ")}.`;
      }
    }

    const horizon = startOfLocalDay(now);
    horizon.setDate(horizon.getDate() + horizonDays);
    const horizonYmd = formatLocalYmd(horizon);

    const futureSchedules = await GymSchedule.find({
      date: { $gte: todayYmd, $lte: horizonYmd },
    }).lean();

    const candidates = [];
    for (const sched of futureSchedules) {
      for (const sl of sched.slots || []) {
        if (sl.isClosed) continue;
        const booked = sl.bookedCount || 0;
        const cap = sl.capacity || 0;
        if (booked >= cap) continue;
        if (isSlotInPast(sched.date, sl.startTime)) continue;
        if ((sl.bookings || []).some((b) => String(b.user) === String(userId))) continue;

        const key = computeSlotKey(sl);
        const hist = totalsBySlotKey.get(key);
        const historicalUtilPct =
          hist && hist.capacity > 0 ? (hist.booked / hist.capacity) * 100 : overallUtilizationPct;

        const currentFillPct = cap > 0 ? (booked / cap) * 100 : 0;
        const effectiveCrowd = 0.55 * historicalUtilPct + 0.45 * currentFillPct;
        const crowdLevel = crowdBandFromPct(effectiveCrowd);

        let score = 38;
        const reasons = [];

        if (prefs.preferLowCrowdGym) {
          score += (100 - effectiveCrowd) * 0.34;
          if (crowdLevel === "low") {
            reasons.push("Lower typical crowding for this time block.");
          } else if (crowdLevel === "high") {
            reasons.push("This window tends to be busier; still bookable.");
          }
        } else {
          score += effectiveCrowd * 0.1;
        }

        score += ((cap - booked) / cap) * 14;

        const mid = slotMidpointMinutes(sl.startTime, sl.endTime);
        if (prefs.preferredGymTimeFrom && prefs.preferredGymTimeTo) {
          if (HM_RE.test(prefs.preferredGymTimeFrom) && HM_RE.test(prefs.preferredGymTimeTo)) {
            const a = parseHmToMinutes(prefs.preferredGymTimeFrom);
            const b = parseHmToMinutes(prefs.preferredGymTimeTo);
            if (mid >= a && mid <= b) {
              score += 30;
              reasons.push("Matches your saved preferred hours.");
            } else {
              const dist = mid < a ? a - mid : mid - b;
              score -= Math.min(24, Math.floor(dist / 30) * 5);
            }
          }
        } else if (prefs.preferredGymTimeFrom && HM_RE.test(prefs.preferredGymTimeFrom)) {
          const center = parseHmToMinutes(prefs.preferredGymTimeFrom);
          const dist = Math.abs(mid - center);
          score += Math.max(0, 26 - Math.floor(dist / 20) * 4);
          if (dist <= 45) reasons.push("Close to your preferred time.");
        }

        const wd = utcWeekdayIndex(sched.date);
        if (topDay && topDay.bookingCount > 0 && wd === topDay.weekday) {
          score += 20;
          reasons.push(`Lines up with your usual ${topDay.label} pattern.`);
        }
        if (topSlotEntry && topSlotEntry[1] > 0 && key === topSlotEntry[0]) {
          score += 16;
          reasons.push("Matches a time block you have booked before.");
        }

        const busiestWd = globalBusyWeekdays[0];
        if (
          prefs.preferLowCrowdGym &&
          busiestWd &&
          busiestWd.weekday === wd &&
          busiestWd.avgUtilizationPct >= 58
        ) {
          score -= 9;
        }

        candidates.push({
          scheduleId: String(sched._id),
          slotId: String(sl._id),
          date: sched.date,
          dayLabel: sched.dayLabel || "",
          startTime: sl.startTime,
          endTime: sl.endTime,
          score: Math.round(score * 10) / 10,
          crowdLevel,
          currentFillPct: Math.round(currentFillPct * 10) / 10,
          historicalUtilizationPct: Math.round(historicalUtilPct * 10) / 10,
          effectiveCrowdPct: Math.round(effectiveCrowd * 10) / 10,
          reasons: [...new Set(reasons)].slice(0, 5),
        });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const personalized = candidates.slice(0, personalizedLimit);

    const topPick = personalized[0];
    let aiInsight =
      "This uses an on-server scoring model (crowd history, live fill, your saved hours, and your past training days) — a lightweight recommender; no data is sent to an external AI service.";

    if (topPick) {
      aiInsight = `Top pick for you: ${topPick.date} · ${topPick.startTime}–${topPick.endTime} · crowd: ${topPick.crowdLevel}. ${topPick.reasons[0] || "Weighted for you, not generic traffic."}`;
    }

    return {
      range: { days, from: fromYmd, to: toYmd },
      horizonDays,
      recommended,
      leastBusyTime,
      peakBusyWindow: peak
        ? {
            timeRange: peak.key.split("-").join(" to "),
            utilizationPct: peak.utilizationPct,
          }
        : null,
      quietWindow: low
        ? {
            timeRange: low.key.split("-").join(" to "),
            utilizationPct: low.utilizationPct,
          }
        : null,
      overallUtilizationPct,
      bestApproach,
      preferences: prefs,
      personalized,
      weeklyPattern: {
        user: userWeekdayPattern,
        globalBusyWeekdays,
        detectedSummary: weeklyDetectedSummary,
      },
      aiInsight,
    };
}

export async function listUpcomingGymFloorSlotsForChat({ maxSlots = 16, horizonDays = 21 } = {}) {
  const now = new Date();
  const todayYmd = formatLocalYmd(startOfLocalDay(now));
  const horizon = startOfLocalDay(now);
  horizon.setDate(horizon.getDate() + Math.min(60, Math.max(1, horizonDays)));
  const horizonYmd = formatLocalYmd(horizon);

  const schedules = await GymSchedule.find({
    date: { $gte: todayYmd, $lte: horizonYmd },
  })
    .sort({ date: 1 })
    .limit(45)
    .lean();

  const out = [];
  for (const sched of schedules) {
    for (const sl of sched.slots || []) {
      if (sl.isClosed) continue;
      const booked = sl.bookedCount || 0;
      const cap = sl.capacity || 0;
      if (booked >= cap) continue;
      if (isSlotInPast(sched.date, sl.startTime)) continue;
      out.push({
        scheduleId: String(sched._id),
        slotId: String(sl._id),
        date: sched.date,
        startTime: sl.startTime,
        endTime: sl.endTime,
        openSpots: cap - booked,
        capacity: cap,
      });
      if (out.length >= maxSlots) return out;
    }
  }
  return out;
}

export async function getGymSlotRecommendations(req, res) {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can view recommendations." });
    }

    const payload = await buildStudentGymRecommendationPayload(req.user.id, req.query);
    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load recommendations." });
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

    if (syncGymSlotsAutoDisableSchedule(schedule)) {
      await schedule.save();
    }

    if (dateStringIsBeforeTodayLocal(schedule.date)) {
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

    if (slot.closedBy) {
      return res.status(400).json({ message: "This slot is not available for booking." });
    }

    const ruleErr = await validateTargetSlotForStudent(uid, schedule, slot, {
      skipDailyLimit: false,
      excludeSlotIds: [],
      scheduleDoc: schedule,
      allowFullSlot: false,
    });
    if (ruleErr) {
      return res.status(400).json({ message: ruleErr });
    }

    // If the user was previously in the waitlist for this slot, remove that entry.
    slot.waitlist = (slot.waitlist || []).filter(
      (w) => String(w.user) !== String(uid),
    );

    slot.bookings = list;
    slot.bookings.push({ user: uid, reminderSentAt: null });
    slot.bookedCount = booked + 1;
    syncGymSlotsAutoDisableSchedule(schedule);
    await schedule.save();

    await createGymNotification(
      uid,
      `Booking confirmed: gym slot ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      "gym",
      "booking_confirmation",
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

    if (syncGymSlotsAutoDisableSchedule(schedule)) {
      await schedule.save();
    }

    if (dateStringIsBeforeTodayLocal(schedule.date)) {
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

    if (isSlotInPast(schedule.date, slot.startTime) || slot.closedBy) {
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
      allowFullSlot: true,
    });
    if (ruleErr) {
      return res.status(400).json({ message: ruleErr });
    }

    slot.waitlist = waitlist;
    slot.waitlist.push({ user: uid });
    await createGymNotification(
      uid,
      `Waitlist joined — we will notify you if a seat opens for ${formatSlotNotification(
        schedule.date,
        schedule.dayLabel,
        slot.startTime,
        slot.endTime,
      )}.`,
      "gym",
      "waitlist_join",
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

export async function adminPatchGymSlotCapacity(req, res) {
  try {
    const { scheduleId, slotId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(slotId)
    ) {
      return res.status(400).json({ message: "Invalid schedule or slot id." });
    }

    const { capacity } = req.body || {};
    const c = Number(capacity);
    if (capacity === undefined || capacity === null || String(capacity).trim() === "") {
      return res.status(400).json({ message: "capacity is required." });
    }
    if (!Number.isInteger(c) || c < 1 || c > 500) {
      return res.status(400).json({ message: "Capacity must be a whole number from 1 to 500." });
    }

    const schedule = await GymSchedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: "Schedule not found." });

    const slot = schedule.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    const booked = slot.bookedCount || 0;
    if (c < booked) {
      return res.status(400).json({
        message: `Capacity cannot be lower than current bookings (${booked}). Remove bookings first or pick ${booked} or higher.`,
      });
    }

    const prevCap = slot.capacity || 0;
    slot.capacity = c;

    if (c > prevCap && (slot.bookedCount || 0) < c) {
      await autoPromoteWaitlist(schedule, slot);
    }

    syncGymSlotsAutoDisableSchedule(schedule);
    await schedule.save();

    return res.json({
      message: "Slot capacity updated.",
      slot: {
        slotId: slot._id,
        capacity: slot.capacity,
        bookedCount: slot.bookedCount,
        isClosed: Boolean(slot.isClosed),
      },
    });
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
    const list = await GymNotification.find({ user: uid, isRead: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json(
      (list || []).map((n) => ({
        _id: n._id,
        message: n.message,
        type: n.type,
        category: n.category || "general",
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
    if (dateStringIsBeforeTodayLocal(schedule.date)) {
      return res.status(400).json({ message: "Cannot cancel a booking on a past date." });
    }

    const slot = schedule.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const uid = req.user.id;
    const list = slot.bookings || [];
    const idx = list.findIndex((b) => String(b.user) === String(uid));
    if (idx === -1) {
      return res.status(404).json({ message: "You do not have a booking in this slot." });
    }

    const cancelledLabel = formatSlotNotification(
      schedule.date,
      schedule.dayLabel,
      slot.startTime,
      slot.endTime,
    );

    list.splice(idx, 1);
    slot.bookings = list;
    slot.bookedCount = Math.max(0, (slot.bookedCount || 0) - 1);
    // Auto promotion: if someone is waiting for this slot and the gym becomes available,
    // promote them in FIFO order.
    await autoPromoteWaitlist(schedule, slot);
    syncGymSlotsAutoDisableSchedule(schedule);

    await schedule.save();

    await createGymNotification(
      uid,
      `Cancellation confirmed — your gym booking for ${cancelledLabel} was removed.`,
      "gym",
      "cancellation",
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
        reminderSentAt: null,
      });
      toSl.bookedCount = booked + 1;
      return null;
    };

    if (String(scheduleId) === String(targetScheduleId)) {
      const schedule = await GymSchedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found." });
      }
      if (dateStringIsBeforeTodayLocal(schedule.date)) {
        return res.status(400).json({ message: "Cannot change a booking on a past date." });
      }

      if (syncGymSlotsAutoDisableSchedule(schedule)) {
        await schedule.save();
      }

      const fromSlot = schedule.slots.id(slotId);
      const toSlot = schedule.slots.id(targetSlotId);
      if (!fromSlot || !toSlot) {
        return res.status(404).json({ message: "Slot not found." });
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
      syncGymSlotsAutoDisableSchedule(schedule);
      await schedule.save();
      await createGymNotification(
        uid,
        `Booking updated — your gym slot is now ${formatSlotNotification(
          schedule.date,
          schedule.dayLabel,
          toSlot.startTime,
          toSlot.endTime,
        )}.`,
        "gym",
        "booking_confirmation",
      );
      return res.json({ message: "Booking moved to the new slot." });
    }

    const fromSched = await GymSchedule.findById(scheduleId);
    const toSched = await GymSchedule.findById(targetScheduleId);
    if (!fromSched || !toSched) {
      return res.status(404).json({ message: "Schedule not found." });
    }
    if (dateStringIsBeforeTodayLocal(fromSched.date)) {
      return res.status(400).json({ message: "Cannot change a booking on a past date." });
    }
    if (dateStringIsBeforeTodayLocal(toSched.date)) {
      return res.status(400).json({ message: "Cannot move to a past date." });
    }

    if (syncGymSlotsAutoDisableSchedule(fromSched)) {
      await fromSched.save();
    }
    if (syncGymSlotsAutoDisableSchedule(toSched)) {
      await toSched.save();
    }

    const fromSlot = fromSched.slots.id(slotId);
    const toSlot = toSched.slots.id(targetSlotId);
    if (!fromSlot || !toSlot) {
      return res.status(404).json({ message: "Slot not found." });
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
    syncGymSlotsAutoDisableSchedule(fromSched);
    syncGymSlotsAutoDisableSchedule(toSched);

    await fromSched.save();
    await toSched.save();
    await createGymNotification(
      uid,
      `Booking updated — your gym slot is now ${formatSlotNotification(
        toSched.date,
        toSched.dayLabel,
        toSlot.startTime,
        toSlot.endTime,
      )}.`,
      "gym",
      "booking_confirmation",
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
    for (const doc of list) {
      if (syncGymSlotsAutoDisableSchedule(doc)) {
        await doc.save();
      }
    }
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

    const window = resolveScheduleWindowTimes(req.body, date);
    const { openingTime, closingTime } = window;

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
    schedule.useSpecialHours = Boolean(window.useSpecialHours);
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
