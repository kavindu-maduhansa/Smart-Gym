import crypto from "node:crypto";
import TrainerSchedule from "../models/TrainerSchedule.js";
import ChatSession from "../models/ChatSession.js";
import ChatTurn from "../models/ChatTurn.js";
import User from "../models/User.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import {
  GYM_REFUSAL_MESSAGE,
  extractGoal,
  isGymRelatedMessage,
  normalizeQuestion,
  parseAdminAnalyticsIntent,
  parseChatIntent,
} from "../utils/chatUtils.js";
import { generateGymAssistantReply } from "../utils/openai.js";
import { generateFallbackGymReply } from "../utils/fallbackGymAssistant.js";

function uniqPush(arr, value) {
  if (!value) return arr;
  const a = Array.isArray(arr) ? arr : [];
  if (a.includes(value)) return a;
  return [...a, value];
}

function normalizeLower(s) {
  return String(s || "").toLowerCase();
}

function extractDaysPerWeek(text) {
  const t = normalizeLower(text);
  // examples: "2 days", "3 days per week", "4 times a week"
  const m = t.match(/\b(\d{1,2})\s*(day|days|time|times)\b(?:.*\bweek\b)?/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0 || n > 14) return null;
  return n;
}

function extractLevel(text) {
  const t = normalizeLower(text);
  if (t.includes("beginner")) return "beginner";
  if (t.includes("intermediate")) return "intermediate";
  if (t.includes("advanced")) return "advanced";
  return "";
}

function extractEquipment(text) {
  const t = normalizeLower(text);
  let out = [];
  if (/\bhome\b/.test(t)) out.push("home");
  if (/\bgym\b/.test(t)) out.push("gym");
  if (/\bdumbbell|dumbbells|db\b/.test(t)) out.push("dumbbell");
  if (/\bbarbell\b/.test(t)) out.push("barbell");
  if (/\bmachine|machines\b/.test(t)) out.push("machines");
  if (/\bkettlebell|kettlebells\b/.test(t)) out.push("kettlebell");
  return out;
}

function extractInjurySummary(text) {
  const t = normalizeLower(text);
  if (/(no\s*injur|no\s*pain|none)/.test(t)) return "No injuries reported.";
  // simple body-part capture
  if (/(knee|shoulder|back|lower back|neck|wrist|elbow|ankle|hip)/.test(t) && /(pain|hurt|injur|sore)/.test(t)) {
    return text.trim().slice(0, 140);
  }
  return "";
}

function updateGamification(session, { toolIntent, message }) {
  const now = new Date();
  const last = session.lastActiveAt ? new Date(session.lastActiveAt) : null;

  // Streak: count consecutive days with activity.
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (!last) {
    session.streakDays = 1;
  } else {
    const diffDays = Math.round((startOfDay(now) - startOfDay(last)) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) {
      // same day, keep streak
    } else if (diffDays === 1) {
      session.streakDays = (session.streakDays || 0) + 1;
    } else {
      session.streakDays = 1;
    }
  }
  session.lastActiveAt = now;

  // Points
  let add = 1; // base per message
  if (toolIntent === "book_slot") add += 10;
  if (toolIntent === "cancel_slot") add += 3;
  if (toolIntent === "recommendations") add += 2;
  const t = normalizeLower(message);
  if (/(injury|pain|rehab|mobility|recovery)/.test(t)) add += 2;
  if (/(form|technique|how to do|proper form)/.test(t)) add += 2;

  session.points = (session.points || 0) + add;

  // Badges
  if ((session.points || 0) >= 1) session.badges = uniqPush(session.badges, "First Chat");
  if ((session.points || 0) >= 50) session.badges = uniqPush(session.badges, "Gym Learner");
  if ((session.points || 0) >= 150) session.badges = uniqPush(session.badges, "Gym Pro");
  if ((session.streakDays || 0) >= 3) session.badges = uniqPush(session.badges, "3-Day Streak");
  if ((session.streakDays || 0) >= 7) session.badges = uniqPush(session.badges, "7-Day Streak");
  if (toolIntent === "book_slot") session.badges = uniqPush(session.badges, "Booked a Session");
}

function updateMemory(session, { message }) {
  const days = extractDaysPerWeek(message);
  if (days !== null) session.daysPerWeek = days;

  const lvl = extractLevel(message);
  if (lvl) session.level = lvl;

  const inj = extractInjurySummary(message);
  if (inj) session.injuries = inj;

  const eq = extractEquipment(message);
  if (eq.length) {
    for (const e of eq) session.equipment = uniqPush(session.equipment, e);
  }

  // preferences (very lightweight)
  const t = normalizeLower(message);
  if (/(morning|evening|night)\s*(workout|train)/.test(t) || /(vegetarian|vegan|halal|keto)/.test(t)) {
    session.preferences = message.trim().slice(0, 160);
  }
}

function wasAskingFollowUps(text) {
  const t = (text || "").toLowerCase();
  // Heuristic: our assistant often ends with a "questions" section and question marks.
  return t.includes("question") || t.includes("questions") || t.includes("?") || t.includes("follow-up");
}

function isLikelyFollowUpAnswer(text) {
  const t = (text || "").trim().toLowerCase();
  if (!t) return false;

  // If the user is responding to a question by repeating/quoting it, allow it.
  // (Users sometimes tap-copy the question text or include a "?".)
  if (t.includes("?")) return true;
  if (/how\s+many|days\/week|days per week|per week/.test(t)) return true;

  // Short, direct answers commonly used to respond to follow-up questions.
  if (/^\d+\s*(day|days|time|times)\b/.test(t)) return true; // e.g. "2 days"
  if (/^\d+\s*(day|days|time|times)\s*\/\s*week\b/.test(t)) return true;
  if (/(beginner|intermediate|advanced)/.test(t)) return true;
  if (/(no\s*injur|no\s*pain|none|nope|yes|yeah)/.test(t)) return true;
  if (/(home|gym|dumbbell|barbell|machines)/.test(t)) return true;

  // Very short answer (likely to be a follow-up response like "2", "yes", "no").
  if (t.length <= 12 && /^[a-z0-9\s/.-]+$/.test(t)) return true;

  return false;
}

function toShortSlot(slot) {
  return {
    _id: slot._id?.toString?.() || slot._id,
    title: slot.title,
    date: slot.date,
    time: slot.time,
    trainer: slot.trainer?.name || "",
  };
}

async function getAvailableSlots() {
  return TrainerSchedule.find({ bookedBy: null }).populate({
    path: "trainer",
    select: "name email",
  });
}

async function getMyBookings(userId) {
  return TrainerSchedule.find({ bookedBy: userId }).populate({
    path: "trainer",
    select: "name email",
  });
}

function parseHourFromTimeString(timeStr) {
  // supports "HH:mm" or "H:mm" or "HH.mm"
  const m = String(timeStr || "").match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  if (Number.isNaN(h) || h < 0 || h > 23) return null;
  return h;
}

function hourBucketLabel(h) {
  if (h >= 5 && h < 9) return "Early morning (5–9)";
  if (h >= 9 && h < 12) return "Morning (9–12)";
  if (h >= 12 && h < 16) return "Afternoon (12–4)";
  if (h >= 16 && h < 20) return "Evening (4–8)";
  return "Late evening (8–11)";
}

async function buildCrowdRecommendations() {
  // Estimate “crowd” by counting how many schedules are booked per hour bucket.
  // This is simple but works well with your existing TrainerSchedule data.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const booked = await TrainerSchedule.find({
    bookedBy: { $ne: null },
    createdAt: { $gte: since },
  }).select("time");

  const counts = new Map();
  for (const s of booked) {
    const h = parseHourFromTimeString(s.time);
    if (h === null) continue;
    const label = hourBucketLabel(h);
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  // Ensure all buckets exist, even if zero.
  const buckets = [
    "Early morning (5–9)",
    "Morning (9–12)",
    "Afternoon (12–4)",
    "Evening (4–8)",
    "Late evening (8–11)",
  ];

  const ranked = buckets
    .map((label) => ({ label, bookings: counts.get(label) || 0 }))
    .sort((a, b) => a.bookings - b.bookings);

  return ranked.slice(0, 2);
}

async function buildPersonalPlanHints({ userId, goal }) {
  // Use minimal profile info (since your User schema is lean).
  const user = await User.findById(userId).select("membershipType").lean();
  const membershipType = user?.membershipType || "";
  const g = (goal || "").toLowerCase();

  if (g === "weight loss") {
    return {
      workout: [
        "2–4 strength sessions/week + 2 short cardio sessions",
        "Focus on full-body compounds + steps (daily walking)",
        "Keep workouts 45–60 min for consistency",
      ],
      diet: [
        "Small calorie deficit (300–500 kcal/day)",
        "Protein daily + veggies with meals",
        "Limit sugary drinks/snacks",
      ],
      note: membershipType ? `Membership: ${membershipType}.` : "",
    };
  }

  if (g === "muscle gain") {
    return {
      workout: [
        "3–5 strength sessions/week (progressive overload)",
        "Prioritize compound lifts + enough volume per muscle",
        "Track weights/reps and progress weekly",
      ],
      diet: [
        "Small calorie surplus (200–350 kcal/day)",
        "Protein daily + carbs around workouts",
        "Sleep 7–9h for recovery",
      ],
      note: membershipType ? `Membership: ${membershipType}.` : "",
    };
  }

  // Default
  return {
    workout: ["2–4 strength sessions/week", "Add light cardio for health", "Progress slowly and focus on form"],
    diet: ["Protein daily", "Whole foods most of the time", "Hydration + sleep"],
    note: membershipType ? `Membership: ${membershipType}.` : "",
  };
}

async function bookSlotById({ userId, slotId }) {
  const schedule = await TrainerSchedule.findById(slotId).populate({
    path: "trainer",
    select: "name email",
  });
  if (!schedule) return { ok: false, error: "Session not found" };
  if (schedule.bookedBy) return { ok: false, error: "This session is already booked by someone else" };

  schedule.bookedBy = userId;
  await schedule.save();
  return { ok: true, schedule };
}

async function cancelSlotById({ userId, slotId, isAdminUser }) {
  const schedule = await TrainerSchedule.findById(slotId).populate({
    path: "trainer",
    select: "name email",
  });
  if (!schedule) return { ok: false, error: "Session not found" };

  // Admins can cancel any; students can only cancel their own.
  if (!isAdminUser && schedule.bookedBy?.toString?.() !== userId?.toString?.()) {
    return { ok: false, error: "Forbidden: You can only cancel your own booking" };
  }

  schedule.bookedBy = null;
  schedule.attendanceStatus = "Pending";
  await schedule.save();
  return { ok: true, schedule };
}

function buildAssistantSystemPrompt({ role }) {
  return [
    "You are the Smart Gym virtual fitness assistant for a web app.",
    "Answer ONLY gym-related questions.",
    "Allowed topics: workouts (plans, exercises, splits), diet & nutrition (balanced meals, weight loss, muscle gain), supplements (protein, creatine, safe usage), gym equipment usage, exercise form/technique, injury prevention, recovery basics, gym services, membership, rules, and booking gym slots/sessions.",
    "If the user asks something NOT related to gym/fitness, you MUST respond with exactly this sentence and nothing else:",
    `\"${GYM_REFUSAL_MESSAGE}\"`,
    "",
    "Response style requirements:",
    "- Friendly and human-like tone.",
    "- Short and clear.",
    "- Use a simple structure when helpful: a 1-line answer, then bullet points, then 1-2 follow-up questions.",
    "- For workout/diet plans: always use bullet points.",
    "- For injury/pain topics: give cautious advice, suggest reducing load, and recommend medical evaluation if severe/persistent symptoms.",
    "- For exercise form: give step-by-step cues + common mistakes.",
    "- Suggest off-peak workout times to reduce crowding unless the user asks otherwise.",
    "- Ask 1-2 follow-up questions when needed (goal, days/week, experience, injuries, equipment).",
    "- Never mention that you used tools or APIs.",
    role === "admin" ? "- Admin behavior: if the user asks for chat/admin analytics, summarize the provided data clearly." : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildToolContextString({ toolResult }) {
  if (!toolResult || Object.keys(toolResult).length === 0) return "";
  return `ToolResult (schedule/booking facts for this request): ${JSON.stringify(toolResult).slice(0, 2000)}`;
}

async function ensureChatSession({ userId, userRole, sessionIdFromClient }) {
  let sessionId = sessionIdFromClient || crypto.randomUUID();

  // sessionId is globally unique; avoid collisions.
  let session = await ChatSession.findOne({ sessionId });
  if (session) {
    if (session.userId?.toString?.() !== userId?.toString?.()) {
      sessionId = crypto.randomUUID();
      session = await ChatSession.create({
        sessionId,
        userId,
        userRole,
        goal: "",
      });
    } else if (session.userRole !== userRole) {
      session.userRole = userRole;
      await session.save();
    }
  } else {
    session = await ChatSession.create({
      sessionId,
      userId,
      userRole,
      goal: "",
    });
  }

  return { session, sessionId };
}

export async function chat(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { message, sessionId: sessionIdFromClient } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "message is required" });
    }

    const userMessage = message.trim();
    if (!userMessage) return res.status(400).json({ message: "message cannot be empty" });

    // Admin analytics requests are deterministic.
    const adminIntent = parseAdminAnalyticsIntent(userMessage);
    if (userRole === "admin" && (adminIntent.wantsLogs || adminIntent.wantsMostAsked || adminIntent.wantsEngagement)) {
      const limit = 20;
      let adminData = {};

      if (adminIntent.wantsLogs) {
        const logs = await ChatTurn.find({})
          .sort({ createdAt: -1 })
          .limit(limit)
          .select("userMessage assistantReply normalizedQuestion goalAtTime userRole createdAt")
          .lean();
        adminData.logs = logs;
      }

      if (adminIntent.wantsMostAsked) {
        const top = await ChatTurn.aggregate([
          { $match: { normalizedQuestion: { $ne: "" } } },
          {
            $group: { _id: "$normalizedQuestion", count: { $sum: 1 }, lastAsked: { $max: "$createdAt" } },
          },
          { $sort: { count: -1, lastAsked: -1 } },
          { $limit: 7 },
        ]);
        adminData.mostAsked = top.map((t) => ({ question: t._id, count: t.count }));
      }

      if (adminIntent.wantsEngagement) {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [totalTurns, uniqueUsers] = await Promise.all([
          ChatTurn.countDocuments({ createdAt: { $gte: since } }),
          ChatTurn.distinct("userId", { createdAt: { $gte: since } }),
        ]);

        const byRole = await ChatTurn.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: "$userRole", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        adminData.engagement = {
          totalTurnsLast30Days: totalTurns,
          uniqueUsersLast30Days: uniqueUsers.length,
          byRole: byRole.map((r) => ({ role: r._id, turns: r.count })),
        };
      }

      const reply = adminIntent.wantsLogs
        ? "Here are the latest chat logs."
        : adminIntent.wantsMostAsked
          ? "Here are the most asked questions."
          : "Here are the engagement stats.";

      const { session } = await ensureChatSession({ userId, userRole, sessionIdFromClient });
      await ChatTurn.create({
        sessionId: session.sessionId,
        userId,
        userRole,
        goalAtTime: session.goal || "",
        userMessage,
        assistantReply: reply,
        normalizedQuestion: normalizeQuestion(userMessage),
        toolIntent: "",
        toolSlotId: "",
      });

      return res.status(200).json({ reply, sessionId: session.sessionId, goal: session.goal || "", admin: adminData });
    }

    const { session, sessionId } = await ensureChatSession({ userId, userRole, sessionIdFromClient });

    const detectedGoal = extractGoal(userMessage);
    if (detectedGoal && detectedGoal !== session.goal) {
      session.goal = detectedGoal;
    }

    const normalizedQuestion = normalizeQuestion(userMessage);
    const intent = parseChatIntent(userMessage);

    // Execute booking-related "tools" deterministically.
    let toolResult = {};
    if (intent.intent === "get_slots") {
      const slots = await getAvailableSlots();
      toolResult = { kind: "available_slots", slots: slots.slice(0, 8).map(toShortSlot) };
    }

    if (intent.intent === "book_slot") {
      if (intent.slotId) {
        const result = await bookSlotById({ userId, slotId: intent.slotId });
        toolResult = result.ok
          ? { kind: "booked", slot: toShortSlot(result.schedule) }
          : { kind: "booking_error", error: result.error };
      } else {
        const slots = await getAvailableSlots();
        toolResult = { kind: "needs_slot_id", slots: slots.slice(0, 8).map(toShortSlot) };
      }
    }

    if (intent.intent === "cancel_slot") {
      if (intent.slotId) {
        const result = await cancelSlotById({ userId, slotId: intent.slotId, isAdminUser: userRole === "admin" });
        toolResult = result.ok
          ? { kind: "cancelled", slot: toShortSlot(result.schedule) }
          : { kind: "cancel_error", error: result.error };
      } else {
        const bookings = await getMyBookings(userId);
        toolResult = { kind: "my_bookings_need_slot_id", bookings: bookings.slice(0, 8).map(toShortSlot) };
      }
    }

    if (intent.intent === "recommendations") {
      const lowCrowd = await buildCrowdRecommendations();
      const planHints = await buildPersonalPlanHints({ userId, goal: session.goal || detectedGoal || "" });
      toolResult = {
        kind: "recommendations",
        lowCrowdTimes: lowCrowd,
        planHints,
      };
    }

    // Update memory + gamification every user message
    updateMemory(session, { message: userMessage });
    updateGamification(session, { toolIntent: intent.intent, message: userMessage });
    await session.save();

    // If the previous assistant turn asked follow-up questions, allow short follow-up answers
    // even when they don't contain gym keywords (e.g. "2 days", "beginner", "no injuries").
    const lastTurns = await ChatTurn.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(1);
    const lastAssistantText = lastTurns?.[0]?.assistantReply || "";
    const allowAsFollowUp =
      wasAskingFollowUps(lastAssistantText) && isLikelyFollowUpAnswer(userMessage);

    // Gym-only deterministic refusal gate.
    if (!isGymRelatedMessage(userMessage) && !toolResult.kind && !allowAsFollowUp) {
      await ChatTurn.create({
        sessionId,
        userId,
        userRole,
        goalAtTime: session.goal || "",
        userMessage,
        assistantReply: GYM_REFUSAL_MESSAGE,
        normalizedQuestion,
        toolIntent: "",
        toolSlotId: "",
      });

      return res.status(200).json({ reply: GYM_REFUSAL_MESSAGE, sessionId, goal: session.goal || "" });
    }

    // Conversation context: last N turns from this session.
    const recentTurns = await ChatTurn.find({ sessionId }).sort({ createdAt: -1 }).limit(12);
    const contextTurns = recentTurns
      .slice()
      .reverse()
      .flatMap((t) => [
        { role: "user", content: t.userMessage },
        { role: "assistant", content: t.assistantReply },
      ]);

    const systemPrompt = buildAssistantSystemPrompt({ role: userRole });
    const toolContext = buildToolContextString({ toolResult });

    const messages = [
      { role: "system", content: systemPrompt },
      ...(toolContext ? [{ role: "system", content: toolContext }] : []),
      { role: "system", content: `User role: ${userRole}. Current goal: ${session.goal || "not specified"}.` },
      ...(contextTurns || []),
      { role: "user", content: userMessage },
    ];

    let assistantReply = "";
    try {
      assistantReply = await generateGymAssistantReply({ messages, temperature: 0.35 });
    } catch (openAIError) {
      console.error("OpenAI error:", openAIError);
      // If OpenAI is unavailable (missing API key, timeout, etc.), fall back to
      // a rule-based gym assistant so users still get correct gym answers.
      assistantReply = generateFallbackGymReply({
        message: userMessage,
        goal: session.goal || "",
        toolResult,
      });
    }

    // Hard enforce refusal string.
    const trimmedReply = (assistantReply || "").trim();
    const finalReply = trimmedReply.includes(GYM_REFUSAL_MESSAGE) ? GYM_REFUSAL_MESSAGE : trimmedReply;

    await ChatTurn.create({
      sessionId,
      userId,
      userRole,
      goalAtTime: session.goal || "",
      userMessage,
      assistantReply: finalReply,
      normalizedQuestion,
      toolIntent: intent.intent || "",
      toolSlotId: intent.slotId || "",
    });

    return res.status(200).json({
      reply: finalReply,
      sessionId,
      goal: session.goal || "",
      memory: {
        goal: session.goal || "",
        level: session.level || "",
        daysPerWeek: session.daysPerWeek ?? null,
        injuries: session.injuries || "",
        equipment: session.equipment || [],
        preferences: session.preferences || "",
      },
      gamification: {
        points: session.points || 0,
        streakDays: session.streakDays || 0,
        badges: session.badges || [],
      },
      ...(toolResult.kind ? { toolResult } : {}),
    });
  } catch (error) {
    console.error("chat error:", error);
    return res.status(500).json({ message: "Chatbot failed to respond. Please try again." });
  }
}

export async function getSlots(req, res) {
  try {
    const schedules = await getAvailableSlots();
    return res.status(200).json({ slots: schedules.slice(0, 50).map(toShortSlot) });
  } catch {
    return res.status(500).json({ message: "Failed to fetch slots." });
  }
}

export async function bookSlot(req, res) {
  try {
    const { slotId } = req.body || {};
    if (!slotId) return res.status(400).json({ message: "slotId is required" });
    const result = await bookSlotById({ userId: req.user.id, slotId });
    if (!result.ok) return res.status(400).json({ message: result.error });
    return res.status(200).json({ message: "Session booked successfully!", slot: toShortSlot(result.schedule) });
  } catch {
    return res.status(500).json({ message: "Booking failed." });
  }
}

export async function cancelSlot(req, res) {
  try {
    const { slotId } = req.body || {};
    if (!slotId) return res.status(400).json({ message: "slotId is required" });
    const result = await cancelSlotById({
      userId: req.user.id,
      slotId,
      isAdminUser: req.user.role === "admin",
    });
    if (!result.ok) return res.status(400).json({ message: result.error });
    return res.status(200).json({ message: "Booking cancelled successfully!", slot: toShortSlot(result.schedule) });
  } catch {
    return res.status(500).json({ message: "Cancellation failed." });
  }
}

// Admin analytics endpoints (optional UI)
export async function adminLogs(req, res) {
  const limit = Math.max(1, Number(req.query.limit || 20));
  const logs = await ChatTurn.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("userMessage assistantReply normalizedQuestion goalAtTime userRole createdAt")
    .lean();
  return res.status(200).json({ logs });
}

export async function adminMostAsked(req, res) {
  const limit = Math.max(1, Number(req.query.limit || 7));
  const top = await ChatTurn.aggregate([
    { $match: { normalizedQuestion: { $ne: "" } } },
    {
      $group: {
        _id: "$normalizedQuestion",
        count: { $sum: 1 },
        lastAsked: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1, lastAsked: -1 } },
    { $limit: limit },
  ]);
  return res.status(200).json({ mostAsked: top.map((t) => ({ question: t._id, count: t.count })) });
}

export async function adminEngagement(req, res) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalTurns, uniqueUsers] = await Promise.all([
    ChatTurn.countDocuments({ createdAt: { $gte: since } }),
    ChatTurn.distinct("userId", { createdAt: { $gte: since } }),
  ]);

  const byRole = await ChatTurn.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: "$userRole", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return res.status(200).json({
    engagement: {
      totalTurnsLast30Days: totalTurns,
      uniqueUsersLast30Days: uniqueUsers.length,
      byRole: byRole.map((r) => ({ role: r._id, turns: r.count })),
    },
  });
}

// --- History endpoints (per-user) ---
export async function listMyChatSessions(req, res) {
  try {
    const userId = req.user.id;
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(30)
      .select("sessionId goal updatedAt createdAt")
      .lean();

    // Attach last message preview for each session (small aggregation).
    const sessionIds = sessions.map((s) => s.sessionId);
    const lastTurns = await ChatTurn.aggregate([
      { $match: { userId, sessionId: { $in: sessionIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$sessionId", lastUserMessage: { $first: "$userMessage" }, lastAt: { $first: "$createdAt" } } },
    ]);
    const lastBySession = new Map(lastTurns.map((t) => [t._id, t]));

    return res.status(200).json({
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        goal: s.goal || "",
        updatedAt: s.updatedAt,
        createdAt: s.createdAt,
        lastUserMessage: lastBySession.get(s.sessionId)?.lastUserMessage || "",
        lastAt: lastBySession.get(s.sessionId)?.lastAt || s.updatedAt,
      })),
    });
  } catch (e) {
    console.error("listMyChatSessions error:", e);
    return res.status(500).json({ message: "Failed to load chat history." });
  }
}

export async function getMyChatSessionTurns(req, res) {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

    // Ensure session belongs to user
    const session = await ChatSession.findOne({ sessionId, userId }).lean();
    if (!session) return res.status(404).json({ message: "Chat session not found." });

    const turns = await ChatTurn.find({ sessionId, userId })
      .sort({ createdAt: 1 })
      .select("userMessage assistantReply createdAt toolIntent toolSlotId")
      .lean();

    return res.status(200).json({
      session: {
        sessionId: session.sessionId,
        goal: session.goal || "",
        level: session.level || "",
        daysPerWeek: session.daysPerWeek ?? null,
        injuries: session.injuries || "",
        equipment: session.equipment || [],
        preferences: session.preferences || "",
        points: session.points || 0,
        streakDays: session.streakDays || 0,
        badges: session.badges || [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      turns: turns.map((t) => ({
        createdAt: t.createdAt,
        userMessage: t.userMessage,
        assistantReply: t.assistantReply,
      })),
    });
  } catch (e) {
    console.error("getMyChatSessionTurns error:", e);
    return res.status(500).json({ message: "Failed to load chat session." });
  }
}

