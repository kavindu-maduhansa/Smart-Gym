import mongoose from "mongoose";
import nodemailer from "nodemailer";
import User from "../models/User.js";

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

function schedulesPageUrl() {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/schedules`;
}

function shouldLogPreview() {
  const explicit = String(process.env.BOOKING_EMAIL_LOG_PREVIEW || "").toLowerCase();
  if (explicit === "true" || explicit === "1") return true;
  return !smtpConfigured() && process.env.NODE_ENV === "development";
}

let transporter = null;

function getTransporter() {
  if (!smtpConfigured()) return null;
  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT || "587", 10) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
      requireTLS: port === 587,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim(),
      },
    });
  }
  return transporter;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** For href="" only — do not escape & so query strings stay valid. */
function escapeHref(s) {
  return String(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * Sends gym slot booking confirmation. Never throws; logs errors.
 * If SMTP is not set, logs a preview when BOOKING_EMAIL_LOG_PREVIEW=1 or in development.
 */
export async function sendGymSlotBookingEmail({
  to,
  studentName,
  date,
  dayLabel,
  startTime,
  endTime,
  variant = "booked",
}) {
  if (!to || typeof to !== "string" || !to.includes("@")) return;

  const dayPart = dayLabel ? ` (${dayLabel})` : "";
  const detailLine = `${date}${dayPart} · ${startTime}–${endTime}`;
  const promoted = variant === "promoted";
  const subject = promoted
    ? `Gym slot confirmed (from waitlist) — ${detailLine}`
    : `Gym slot booked — ${detailLine}`;
  const nameSafe = studentName?.trim() ? studentName.trim() : "";
  const greeting = nameSafe ? `Hi ${nameSafe},` : "Hi,";
  const lead = promoted
    ? "A spot opened up — you have been booked for this gym slot from the waitlist."
    : "Your gym slot booking is confirmed.";
  const openSchedules = schedulesPageUrl();
  const text = `${greeting}

${lead}

Date & time: ${detailLine}

Open your bookings: ${openSchedules}
(Smart Schedules → Slot Availability tab.)

Please cancel or move your slot from there if your plans change (subject to the gym's change deadline).

— Smart Gym`;

  const greetHtml = nameSafe ? `Hi ${escapeHtml(nameSafe)},` : "Hi,";
  const hrefSchedules = escapeHref(openSchedules);
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1e293b;">
  <p>${greetHtml}</p>
  <p><strong>${escapeHtml(lead)}</strong></p>
  <table style="margin: 16px 0; border-collapse: collapse;">
    <tr><td style="padding: 6px 12px 6px 0; color:#64748b;">When</td><td style="padding: 6px 0;"><strong>${escapeHtml(detailLine)}</strong></td></tr>
  </table>
  <p style="font-size: 14px; color: #64748b;">
    <a href="${hrefSchedules}" style="color: #2563eb;">Open Smart Schedules</a>
    and use the <strong>Slot Availability</strong> tab to view or change this booking.
  </p>
  <p style="font-size: 14px; color: #64748b;">— Smart Gym</p>
</body>
</html>`;

  const transport = getTransporter();
  if (!transport) {
    if (shouldLogPreview()) {
      console.info("\n[gymBookingMail] --- booking email preview (SMTP not configured) ---");
      console.info("To:", to.trim());
      console.info("Subject:", subject);
      console.info(text);
      console.info("[gymBookingMail] --- end preview ---\n");
    } else if (process.env.NODE_ENV !== "test") {
      console.info("[gymBookingMail] SMTP not configured; set SMTP_HOST, SMTP_USER, SMTP_PASS to send real email.");
    }
    return;
  }

  const from =
    process.env.MAIL_FROM?.trim() || `"Smart Gym" <${process.env.SMTP_USER.trim()}>`;

  try {
    await transport.sendMail({
      from,
      to: to.trim(),
      subject,
      text,
      html,
    });
    console.info(`[gymBookingMail] Sent booking confirmation to ${to.trim()}`);
  } catch (err) {
    console.error("[gymBookingMail] Failed to send booking email:", err?.message || err);
  }
}

/**
 * Load student email from DB and send booking confirmation (or dev preview).
 * Safe to fire-and-forget: errors are logged, not thrown.
 */
export async function queueGymBookingEmailForStudent(userId, booking) {
  const { date, dayLabel, startTime, endTime, variant = "booked" } = booking || {};
  if (!date || !startTime || !endTime) {
    console.warn("[gymBookingMail] skip email: missing slot fields");
    return;
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    console.warn("[gymBookingMail] skip email: invalid user id");
    return;
  }
  try {
    const u = await User.findById(userId).select("name email").lean();
    if (!u?.email) {
      console.warn("[gymBookingMail] skip email: user has no email", String(userId));
      return;
    }
    await sendGymSlotBookingEmail({
      to: u.email,
      studentName: u.name,
      date,
      dayLabel: dayLabel || "",
      startTime,
      endTime,
      variant,
    });
  } catch (e) {
    console.error("[gymBookingMail] queue failed:", e?.message || e);
  }
}
