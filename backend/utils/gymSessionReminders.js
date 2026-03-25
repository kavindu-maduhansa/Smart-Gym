import GymSchedule from "../models/GymSchedule.js";
import TrainerSchedule from "../models/TrainerSchedule.js";
import { notifyStudent, NOTIFICATION_CATEGORY } from "./studentNotifications.js";

function combineDateAndTimeLocal(yyyyMmDd, hhmm) {
  const [y, M, d] = yyyyMmDd.split("-").map(Number);
  const [h, m] = String(hhmm).split(":").map(Number);
  return new Date(y, M - 1, d, h, m, 0, 0);
}

function formatLocalYmd(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

const HM_RE = /^\d{2}:\d{2}$/;

/**
 * Sends one reminder per booking when the session start is within the next N hours (default 2).
 * Uses reminderSentAt on gym booking subdocs and TrainerSchedule to avoid duplicates.
 */
export async function runSessionReminderSweep() {
  const hours = Math.max(
    0.25,
    parseFloat(process.env.GYM_SESSION_REMINDER_HOURS_BEFORE || "2", 10) || 2,
  );
  const leadMs = hours * 3600000;
  const now = Date.now();
  const todayYmd = formatLocalYmd(new Date());

  const gymSchedules = await GymSchedule.find({ date: { $gte: todayYmd } }).limit(400);
  for (const sched of gymSchedules) {
    let touched = false;
    for (const slot of sched.slots || []) {
      const slotStart = combineDateAndTimeLocal(sched.date, slot.startTime).getTime();
      if (slotStart <= now) continue;
      for (const b of slot.bookings || []) {
        if (b.reminderSentAt) continue;
        const msUntil = slotStart - now;
        if (msUntil > 0 && msUntil <= leadMs) {
          await notifyStudent(
            b.user,
            `Reminder: gym floor slot starts in about ${hours} hour(s) — ${sched.date} · ${slot.startTime}–${slot.endTime}.`,
            "gym",
            NOTIFICATION_CATEGORY.SESSION_REMINDER,
          );
          b.reminderSentAt = new Date();
          touched = true;
        }
      }
    }
    if (touched) {
      sched.markModified("slots");
      await sched.save();
    }
  }

  const trainerSessions = await TrainerSchedule.find({
    bookedBy: { $ne: null },
    date: { $gte: todayYmd },
  }).limit(400);

  for (const sess of trainerSessions) {
    const t = String(sess.time || "").trim();
    if (!HM_RE.test(t)) continue;
    const startMs = combineDateAndTimeLocal(sess.date, t).getTime();
    if (startMs <= now) continue;
    if (sess.reminderSentAt) continue;
    const msUntil = startMs - now;
    if (msUntil > 0 && msUntil <= leadMs) {
      await notifyStudent(
        sess.bookedBy,
        `Reminder: trainer session "${sess.title}" starts in about ${hours} hour(s) — ${sess.date} at ${t}.`,
        "trainer",
        NOTIFICATION_CATEGORY.SESSION_REMINDER,
      );
      sess.reminderSentAt = new Date();
      await sess.save();
    }
  }
}
