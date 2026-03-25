// Gym-only restriction and intent parsing for the chatbot.

export const GYM_REFUSAL_MESSAGE =
  "Sorry, I can only help with gym-related topics like workouts, diet, supplements, and bookings. Please ask something related to fitness 💪";

// Local keyword gate: quickly rejects obviously non-gym questions.
// OpenAI system prompt also enforces gym-only behavior.
const GYM_KEYWORDS = [
  // general gym context
  "gym",
  "fitness",
  "bmi",
  "body mass index",
  "bodyweight",
  "body weight",
  "height",
  "weight",
  "kg",
  "kgs",
  "lose",
  "loss",
  "gain",
  "muscle",
  "fat",
  "bulk",
  "cutting",

  // workouts / training
  "workout",
  "exercise",
  "exercises",
  "routine",
  "split",
  "sets",
  "reps",
  "cardio",
  "strength",
  "hypertrophy",
  "warm-up",
  "warmup",
  "cooldown",
  "cool-down",
  "stretch",
  "stretches",
  "injury",
  "injuries",
  "injury prevention",
  "prevent injury",
  "pain",
  "hurt",
  "rehab",
  "recovery",
  "mobility",
  "stability",
  "posture",
  "form",
  "technique",

  // diet / nutrition
  "diet",
  "nutrition",
  "calorie",
  "calories",
  "protein",
  "carbs",
  "carbohydrate",
  "fat",
  "fats",
  "fiber",
  "meal",
  "meals",
  "hydration",
  "water",

  // supplements
  "supplement",
  "supplements",
  "creatine",
  "whey",

  // membership / services / rules
  "membership",
  "member",
  "rule",
  "rules",
  "trainer",

  // equipment usage
  "equipment",
  "bench",
  "treadmill",
  "squat",
  "deadlift",
  "press",
  "pull-up",
  "lat pulldown",
  "bench press",
  "overhead press",
  "row",

  // booking / schedules
  "schedule",
  "schedules",
  "slot",
  "slots",
  "booking",
  "book",
  "cancel",
  "available",
];

export function isGymRelatedMessage(text) {
  const t = (text || "").toLowerCase();
  if (!t.trim()) return false;

  // Treat common body/goal statements as gym-related even if they don't include "gym".
  // Examples: "I want to lose 20kg", "fat loss", "gain 5 kg", "cutting".
  if (/(lose|loss|gain)\s*\d+(\.\d+)?\s*(kg|kgs)\b/.test(t)) return true;
  if (/\b\d+(\.\d+)?\s*(kg|kgs)\b/.test(t) && /(lose|loss|gain|bulk|cut)/.test(t)) return true;

  // If it looks like contact/support, reject unless it also includes gym hints.
  if (
    /\b(help|support|contact)\b/i.test(text) &&
    !/\bgym|workout|diet|supplement|booking|schedule|fitness/i.test(text)
  ) {
    return false;
  }

  return GYM_KEYWORDS.some((k) => t.includes(k));
}

export function normalizeQuestion(text) {
  const t = (text || "").toLowerCase();
  const noPunct = t.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  // Keep it short for analytics cardinality.
  return noPunct.slice(0, 160);
}

export function extractGoal(text) {
  const lower = (text || "").toLowerCase();
  if (
    /weight\s*loss|lose\s*weight|fat\s*loss|cutting|slim|burn\s*fat/.test(lower)
  ) {
    return "weight loss";
  }
  if (
    /muscle\s*gain|gain\s*muscle|bulking|bulk|hypertrophy|lean\s*bulk/.test(lower)
  ) {
    return "muscle gain";
  }
  if (/strength|powerlifting/.test(lower)) return "strength";
  if (/maintenance|general\s*fitness|stay\s*fit/.test(lower)) return "maintenance";
  return "";
}

export function parseSlotId(text) {
  const match = (text || "").match(/\b[a-fA-F0-9]{24}\b/);
  return match ? match[0] : null;
}

export function parseChatIntent(text) {
  const t = (text || "").toLowerCase();
  const slotId = parseSlotId(text);

  const isRecommend =
    /(recommend|recommendation|suggest|best\s*time|low\s*crowd|least\s*crowd|off-peak|off\s*peak)/i.test(
      t
    ) ||
    /(workout\s*time|gym\s*time|best\s*hours)/i.test(t);

  const isGetSlots =
    /(available\s*(slots|schedules)|show\s*slots|get\s*slots|view\s*schedules|view\s*slots|what\s*slots)/i.test(
      t
    ) || /available\s*schedules/i.test(t);

  const isBook =
    /(book|reserve|schedule\s*me|i\s*want\s*to\s*book)/i.test(t) || /\bbook\b/i.test(t);

  const isCancel = /(cancel|remove|drop)\b/i.test(t);

  if (isRecommend) return { intent: "recommendations", slotId };
  if (isCancel) return { intent: "cancel_slot", slotId };
  if (isBook) return { intent: "book_slot", slotId };
  if (isGetSlots) return { intent: "get_slots", slotId };

  return { intent: "", slotId };
}

export function parseAdminAnalyticsIntent(text) {
  const t = (text || "").toLowerCase();
  const wantsLogs =
    /(chat\s*logs|conversation\s*logs|message\s*logs|show\s*logs|logs\s*please)/i.test(t) ||
    (t.includes("logs") && t.includes("chat"));
  const wantsMostAsked = /(most\s*asked|top\s*questions|popular\s*questions)/i.test(t);
  const wantsEngagement =
    /(engagement\s*stats|user\s*engagement|usage\s*stats|engagement)/i.test(t) ||
    (t.includes("stats") && (t.includes("chat") || t.includes("users")));
  return { wantsLogs, wantsMostAsked, wantsEngagement };
}

