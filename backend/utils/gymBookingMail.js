import mongoose from "mongoose";
import nodemailer from "nodemailer";
import User from "../models/User.js";

/** Trim + strip wrapping quotes; remove spaces (Gmail app passwords are often shown as 4×4 groups). */
function getSmtpPass() {
  let p = String(process.env.SMTP_PASS || "").trim();
  if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
    p = p.slice(1, -1);
  }
  return p.replace(/\s+/g, "");
}

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      getSmtpPass(),
  );
}

function schedulesPageUrl() {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/schedules`;
}

/** YYYY-MM-DD for email subject/body (handles ISO strings from Mongo). */
function normalizeScheduleDateForEmail(raw) {
  const s = String(raw || "").trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
}

function shouldLogPreview() {
  const explicit = String(process.env.BOOKING_EMAIL_LOG_PREVIEW || "").toLowerCase();
  if (explicit === "false" || explicit === "0") return false;
  if (explicit === "true" || explicit === "1") return true;
  if (smtpConfigured()) return false;
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  // Many local runs leave NODE_ENV unset — still log a full preview unless production/test.
  return env !== "production" && env !== "test";
}

let transporter = null;

function getTransporter() {
  if (!smtpConfigured()) return null;
  if (!transporter) {
    const user = process.env.SMTP_USER.trim();
    const pass = getSmtpPass();
    const host = (process.env.SMTP_HOST || "").trim().toLowerCase();
    const isGmail = host === "smtp.gmail.com" || host === "gmail";

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    } else {
      const port = parseInt(process.env.SMTP_PORT || "587", 10) || 587;
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port,
        secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
        requireTLS: port === 587,
        auth: { user, pass },
      });
    }
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
  if (!to || typeof to !== "string" || !to.includes("@")) {
    return { outcome: "invalid_address" };
  }

  const dateDisplay = normalizeScheduleDateForEmail(date);
  const dayPart = dayLabel ? ` (${dayLabel})` : "";
  const detailLine = `${dateDisplay}${dayPart} · ${startTime}–${endTime}`;
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
      return { outcome: "preview_logged" };
    }
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[gymBookingMail] SMTP not configured (production/test). No email sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS or BOOKING_EMAIL_LOG_PREVIEW=true.",
      );
    }
    return { outcome: "not_configured" };
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
    return { outcome: "sent" };
  } catch (err) {
    const code = err?.responseCode ?? err?.code;
    const resp = err?.response;
    console.error("[gymBookingMail] Failed to send booking email:", err?.message || err);
    if (code != null || resp) {
      console.error("[gymBookingMail] SMTP response:", { responseCode: code, response: resp });
    }
    if (
      String(err?.message || "")
        .toLowerCase()
        .includes("invalid login") ||
      String(resp || "").includes("535") ||
      err?.responseCode === 535
    ) {
      console.error(
        "[gymBookingMail] Gmail usually rejects your normal password. Use an App Password: Google Account → Security → 2-Step Verification → App passwords → generate, then set SMTP_PASS to that 16-character value.",
      );
    }
    return { outcome: "send_failed", error: err?.message || String(err) };
  }
}

/**
 * Load student email from DB and send booking confirmation (or dev console preview).
 * Does not throw. Returns an outcome for API responses.
 */
export async function queueGymBookingEmailForStudent(userId, booking) {
  const { date, dayLabel, startTime, endTime, variant = "booked" } = booking || {};
  if (!date || !startTime || !endTime) {
    console.warn("[gymBookingMail] skip email: missing slot fields");
    return { outcome: "skipped_missing_fields" };
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    console.warn("[gymBookingMail] skip email: invalid user id");
    return { outcome: "skipped_invalid_user" };
  }
  try {
    const u = await User.findById(userId).select("name email").lean();
    if (!u?.email) {
      console.warn("[gymBookingMail] skip email: user has no email", String(userId));
      return { outcome: "no_user_email" };
    }
    const r = await sendGymSlotBookingEmail({
      to: u.email,
      studentName: u.name,
      date,
      dayLabel: dayLabel || "",
      startTime,
      endTime,
      variant,
    });
    return { ...r, sentTo: u.email.trim() };
  } catch (e) {
    console.error("[gymBookingMail] queue failed:", e?.message || e);
    return { outcome: "queue_error", error: e?.message || String(e) };
  }
}

/** Safe subset for JSON after booking (student sees their own address only when sent). */
export function publicBookingEmailInfo(result) {
  if (!result?.outcome) return undefined;
  const { outcome, sentTo } = result;
  if (outcome === "sent") {
    return { status: "sent", sentTo: sentTo || undefined };
  }
  if (outcome === "preview_logged") {
    return {
      status: "not_sent",
      code: "console_preview",
      help:
        "Your booking is saved. The server is not sending real email yet — a copy was printed in the backend terminal only. To get mail in your inbox, add SMTP settings (e.g. Gmail app password) to backend/.env. Also confirm your Smart Gym account email matches the inbox you check.",
    };
  }
  if (outcome === "not_configured") {
    return {
      status: "not_sent",
      code: "smtp_disabled",
      help:
        "Your booking is saved, but outgoing email is turned off on the server. An admin must set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env (see .env.example).",
    };
  }
  if (outcome === "no_user_email") {
    return {
      status: "not_sent",
      code: "no_profile_email",
      help: "Your booking is saved, but your profile has no email address, so no confirmation could be sent.",
    };
  }
  if (outcome === "send_failed") {
    return {
      status: "not_sent",
      code: "send_failed",
      help:
        "Your booking is saved, but the email did not go out. With Gmail you must use an App Password in backend/.env (SMTP_PASS), not your normal login password — after turning on 2-Step Verification. The message is sent to your Smart Gym profile email, not the admin Gmail. Check Spam, and read the backend terminal for [gymBookingMail] errors.",
    };
  }
  if (outcome === "invalid_address") {
    return {
      status: "not_sent",
      code: "invalid_profile_email",
      help: "Your booking is saved, but the email on your profile looks invalid. Update your account email and try booking again if you need a message.",
    };
  }
  return undefined;
}
