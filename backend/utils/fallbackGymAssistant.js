import { isGymRelatedMessage } from "./chatUtils.js";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function bulletify(lines) {
  return lines.map((l) => `- ${l}`).join("\n");
}

function goalLine(goal) {
  if (!goal) return "";
  if (goal === "weight loss") return "Goal detected: weight loss (calorie deficit + protein).";
  if (goal === "muscle gain") return "Goal detected: muscle gain (calorie surplus + progressive overload).";
  return `Goal detected: ${goal}.`;
}

function section(title, body) {
  const t = (title || "").trim();
  const b = (body || "").trim();
  if (!t && !b) return "";
  if (!t) return b;
  if (!b) return `**${t}**`;
  return `**${t}**\n${b}`;
}

function shortIntro(text) {
  const t = (text || "").trim();
  return t ? `${t}\n\n` : "";
}

function extractLikelyGoal(message) {
  const t = normalize(message);
  if (/weight\s*loss|fat\s*loss|cutting|burn\s*fat/.test(t)) return "weight loss";
  if (/muscle\s*gain|bulking|hypertrophy|bulk/.test(t)) return "muscle gain";
  return "";
}

function formatSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return "";
  return slots
    .slice(0, 8)
    .map((s, idx) => `${idx + 1}. ${s.title} — ${s.date} @ ${s.time} (id: ${s._id})`)
    .join("\n");
}

function parseKgCmFromMessage(message) {
  const text = (message || "").toLowerCase();
  // supports: "70kg", "70 kg", "170cm", "170 cm"
  const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*kg\b/);
  const cmMatch = text.match(/(\d+(?:\.\d+)?)\s*cm\b/);
  const kg = kgMatch ? Number(kgMatch[1]) : null;
  const cm = cmMatch ? Number(cmMatch[1]) : null;
  return { kg, cm };
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obesity";
}

function detectExerciseName(t) {
  const s = (t || "").toLowerCase();
  if (s.includes("squat")) return "squat";
  if (s.includes("deadlift") || s.includes("rdl") || s.includes("romanian deadlift")) return "deadlift";
  if (s.includes("bench press") || (s.includes("bench") && s.includes("press"))) return "bench press";
  if (s.includes("overhead press") || s.includes("shoulder press") || s.includes("ohp")) return "overhead press";
  if (s.includes("row")) return "row";
  if (s.includes("pull-up") || s.includes("pull up") || s.includes("chin-up") || s.includes("chin up")) return "pull-up";
  if (s.includes("lat pulldown") || s.includes("pulldown")) return "lat pulldown";
  return "";
}

function formGuideFor(exercise) {
  switch (exercise) {
    case "squat":
      return {
        title: "Squat form guide",
        cues: [
          "Feet shoulder-width, toes slightly out",
          "Brace your core before you descend",
          "Sit down and back slightly, knees track over toes",
          "Keep chest up and spine neutral",
          "Depth: as low as you can without losing neutral posture",
          "Drive up through mid-foot/heel, keep knees stable",
        ],
        mistakes: [
          "Knees collapsing inward",
          "Heels lifting (poor ankle mobility / stance)",
          "Rounding lower back at the bottom",
          "Cutting depth too high with heavy weight",
        ],
        followUps: ["Do you feel pain in knees/hips/back?", "Are you using barbell, dumbbells, or a machine?"],
      };
    case "deadlift":
      return {
        title: "Deadlift / RDL form guide",
        cues: [
          "Hinge at hips (push hips back), keep spine neutral",
          "Brace core and keep lats tight (pull shoulders down/back)",
          "Bar close to body (almost touching legs)",
          "Drive the floor away, stand tall at the top (no over-lean)",
          "For RDL: slight knee bend, feel stretch in hamstrings",
        ],
        mistakes: [
          "Rounding lower back",
          "Bar drifting away from legs",
          "Yanking the bar (no tension before lift)",
          "Hyperextending at lockout",
        ],
        followUps: ["Is it conventional deadlift or RDL?", "What weight/reps are you aiming for?"],
      };
    case "bench press":
      return {
        title: "Bench press form guide",
        cues: [
          "Feet planted, slight arch is ok, glutes on bench",
          "Shoulder blades back and down (stable base)",
          "Grip so forearms are vertical at the bottom",
          "Lower to mid-chest under control, press up smoothly",
          "Elbows slightly tucked (not flared hard)",
        ],
        mistakes: [
          "Shoulders rolling forward at the bottom",
          "Bouncing the bar off chest",
          "Wrists bent back (keep stacked)",
          "Flaring elbows aggressively (shoulder strain)",
        ],
        followUps: ["Barbell or dumbbells?", "Any shoulder pain?"],
      };
    case "overhead press":
      return {
        title: "Overhead press form guide",
        cues: [
          "Brace core and squeeze glutes (avoid lower-back arch)",
          "Start bar at upper chest, elbows slightly forward",
          "Press up and slightly back so it stacks over mid-foot",
          "Head moves back then through at the top",
          "Control the lowering phase",
        ],
        mistakes: [
          "Overarching lower back",
          "Pressing too far forward (bar in front of you)",
          "Shrugging shoulders up with no control",
        ],
        followUps: ["Standing or seated press?", "Any neck/shoulder discomfort?"],
      };
    case "row":
      return {
        title: "Row form guide (cable or dumbbell)",
        cues: [
          "Keep torso stable, brace core",
          "Pull elbows back toward hips (not straight up)",
          "Squeeze shoulder blades, then control return",
          "Avoid using momentum—slow reps",
        ],
        mistakes: [
          "Rounding shoulders forward",
          "Swinging body to move weight",
          "Shrugging instead of rowing",
        ],
        followUps: ["Cable row, machine row, or dumbbell row?", "Any lower-back pain?"],
      };
    case "pull-up":
      return {
        title: "Pull-up form guide",
        cues: [
          "Start from a dead hang, then engage shoulders (depress scapula)",
          "Think 'pull elbows down' rather than 'chin up'",
          "Keep ribs down and core tight (no excessive swinging)",
          "Control the way down (don’t drop)",
        ],
        mistakes: [
          "Kipping/swinging too much",
          "Half reps only",
          "Shoulders shrugging up to ears",
        ],
        followUps: ["Can you do bodyweight pull-ups or need assistance?", "Goal: strength or muscle?"],
      };
    case "lat pulldown":
      return {
        title: "Lat pulldown form guide",
        cues: [
          "Sit tall, slight lean back (not a big swing)",
          "Pull bar to upper chest, elbows down and back",
          "Keep shoulders down (don’t shrug)",
          "Control the return to full stretch",
        ],
        mistakes: [
          "Pulling behind the neck (often irritates shoulders)",
          "Using too much body swing",
          "Partial range of motion",
        ],
        followUps: ["Wide grip or neutral grip?", "Any shoulder pain?"],
      };
    default:
      return null;
  }
}

export function generateFallbackGymReply({ message, goal, toolResult }) {
  const t = normalize(message);
  const effectiveGoal = goal || extractLikelyGoal(message);

  // Always respect gym-only restriction.
  if (!isGymRelatedMessage(message) && !toolResult?.kind) {
    return (
      "Sorry, I can only help with gym-related topics like workouts, diet, supplements, and bookings. Please ask something related to fitness 💪"
    );
  }

  // Booking slots fallback summary.
  if (toolResult?.kind === "available_slots" && Array.isArray(toolResult.slots)) {
    const slotsText = formatSlots(toolResult.slots);
    return (
      shortIntro(goalLine(effectiveGoal)) +
      section("Available sessions", slotsText || "No slots found.") +
      "\n\n" +
      section("Next step", "To book one, type: `Book slot <id>`.") 
    );
  }

  if (toolResult?.kind === "my_bookings_need_slot_id" && Array.isArray(toolResult.bookings)) {
    const bookingsText = formatSlots(toolResult.bookings);
    return (
      shortIntro(goalLine(effectiveGoal)) +
      section("Your booked sessions", bookingsText || "No bookings found.") +
      "\n\n" +
      section("Next step", "To cancel, type: `Cancel slot <id>`.") 
    );
  }

  // Cancel/book confirmations fallback
  if ((toolResult?.kind === "booked" || toolResult?.kind === "cancelled") && toolResult?.slot) {
    const s = toolResult.slot;
    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(
        "Done",
        `${toolResult.kind === "booked" ? "Booked" : "Cancelled"}: ${s.title} — ${s.date} @ ${s.time} (id: ${s._id}).`
      )
    );
  }

  // WORKOUT plans (rule-based)
  // BMI / Body composition
  if (/(bmi|body mass index)/.test(t)) {
    const { kg, cm } = parseKgCmFromMessage(message);
    if (!kg || !cm) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "BMI calculator",
          "Tell me your **weight (kg)** and **height (cm)**.\nExample: `Calculate BMI for 70kg and 170cm`."
        )
      );
    }

    const meters = cm / 100;
    const bmi = kg / (meters * meters);
    const rounded = Math.round(bmi * 10) / 10;
    const category = bmiCategory(rounded);

    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(
        "Your BMI result",
        bulletify([
          `Weight: ${kg} kg`,
          `Height: ${cm} cm`,
          `BMI: ${rounded}`,
          `Category: ${category}`,
        ])
      ) +
      "\n\n" +
      section(
        "What next?",
        bulletify([
          "If your goal is fat loss: focus on a small calorie deficit + strength training.",
          "If your goal is muscle gain: small surplus + progressive overload.",
          "BMI doesn’t separate muscle vs fat—waist measurement and body-fat estimates help.",
        ])
      ) +
      "\n\n" +
      section("2 questions", bulletify(["What’s your goal right now?", "How many days/week can you train?"]))
    );
  }

  // Injury prevention / pain handling
  if (/(injury prevention|prevent injury|injury|pain|hurt|rehab|mobility|recovery)/.test(t)) {
    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(
        "Injury Prevention Mode",
        bulletify([
          "Warm-up (5–10 min): light cardio + dynamic movements for the joints you’ll train",
          "Technique first: use a weight you can control with full range of motion",
          "Progress slowly: increase load or reps gradually (avoid big jumps week-to-week)",
          "Balance training: include pulling (back) work to match pushing work",
          "Recovery: sleep, hydration, and 1–2 rest days/week",
          "Pain rule: sharp pain = stop; adjust exercise and reduce load; seek medical advice if pain persists",
        ])
      ) +
      "\n\n" +
      section(
        "Quick warm-up template",
        bulletify([
          "2 min brisk walk/cycle",
          "5–8 reps: bodyweight squat + hip hinge",
          "10 reps: band pull-aparts (or light rows)",
          "10 reps: shoulder circles + arm swings",
          "Then 2–3 lighter warm-up sets of your first lift",
        ])
      ) +
      "\n\n" +
      section(
        "2 questions",
        bulletify([
          "Which area is painful (knee/shoulder/back/etc.) and when does it hurt?",
          "What exercise were you doing when you felt it?",
        ])
      )
    );
  }

  // Exercise form guide mode
  if (/(form guide|form|technique|how to do|proper form|posture)/.test(t)) {
    const ex = detectExerciseName(t);
    if (!ex) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "Exercise Form Guide",
          "Tell me the exercise name.\nExamples: `squat`, `deadlift`, `bench press`, `overhead press`, `row`, `pull-up`, `lat pulldown`."
        ) +
        "\n\n" +
        section("1 question", "Which exercise do you want help with?")
      );
    }

    const guide = formGuideFor(ex);
    if (!guide) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section("Exercise Form Guide", `I can help with form—tell me your exercise and equipment.`)
      );
    }

    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(guide.title, bulletify(guide.cues)) +
      "\n\n" +
      section("Common mistakes", bulletify(guide.mistakes)) +
      "\n\n" +
      section("2 questions", bulletify(guide.followUps))
    );
  }

  if (/(workout|workouts|exercise|routine|split)/.test(t)) {
    if (/beginner/.test(t) || /new|starter/.test(t)) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "Beginner full-body plan (3 days/week, 45–60 min)",
          bulletify([
            "Warm-up: 5–8 min light cardio + dynamic stretches",
            "Squat or Leg Press: 3 × 8–12",
            "Dumbbell Bench Press (or Push-ups): 3 × 8–12",
            "Lat Pulldown or Assisted Pull-up: 3 × 8–12",
            "Shoulder Press (DB): 2–3 × 10–12",
            "Romanian Deadlift (DB/Bar): 2–3 × 8–12",
            "Plank: 3 × 30–45 sec",
            "Cool-down: 5 min light stretching",
          ])
        ) +
        "\n\n" +
        section(
          "Quick progression",
          bulletify(["When you hit the top reps for all sets, add a small amount of weight next time."])
        ) +
        "\n\n" +
        section("2 questions", bulletify(["How many days/week can you train?", "Any injuries or pain areas?"]))
      );
    }

    if (/full body/.test(t)) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "Full-body plan (3–4 days/week)",
          bulletify([
            "Day A: Squat/Leg Press + Bench/DB Press + Row + Shoulder + Core",
            "Day B: Deadlift/RDL + Overhead Press + Lat Pulldown + Lunge + Core",
            "Day C: Goblet Squat/Hack + Incline Press + Cable Row + Lateral Raises + Core",
          ])
        ) +
        "\n\n" +
        section(
          "Guidelines",
          bulletify([
            "Rest 48–72h between hard sessions for the same muscles",
            "Most sets: stop with ~1–3 reps in reserve (RIR)",
          ])
        ) +
        "\n\n" +
        section("2 questions", bulletify(["Your level (beginner/intermediate/advanced)?", "What equipment do you have?"]))
      );
    }

    // Generic gym workout response
    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(
        "To build your plan, tell me",
        bulletify([
          "Your goal (weight loss / muscle gain / strength / maintenance)",
          "Days per week + session length",
          "Any injuries + equipment available (dumbbells/barbell/machines)",
        ])
      )
    );
  }

  // DIET / NUTRITION
  if (/(diet|nutrition|meal|calorie|calories|protein|carb|carbohydrate|meal plan)/.test(t)) {
    const isLoss = /weight\s*loss|fat\s*loss|cutting|lose\s*weight/.test(t) || effectiveGoal === "weight loss";
    const isGain = /muscle\s*gain|bulking|bulk|hypertrophy|gain\s*muscle/.test(t) || effectiveGoal === "muscle gain";

    if (isLoss) {
      return (
        shortIntro(goalLine("weight loss")) +
        section(
          "Weight-loss nutrition (simple + effective)",
          bulletify([
            "Create a calorie deficit (usually 300–500 kcal/day).",
            "Protein: ~1.6–2.2 g/kg/day.",
            "Carbs: keep enough for training performance (more on training days).",
            "Fats: include healthy fats (don’t go too low).",
            "Veg + fiber with every meal.",
            "Hydration: 2–3 L/day (more if you sweat).",
          ])
        ) +
        "\n\n" +
        section(
          "Example meals",
          bulletify([
            "Chicken/eggs + rice/roti + vegetables",
            "Yogurt + fruit",
            "Fish/lean meat + potatoes + salad",
          ])
        ) +
        "\n\n" +
        section("2 questions", bulletify(["Your height/weight/age?", "How many days/week do you train?"]))
      );
    }

    if (isGain) {
      return (
        shortIntro(goalLine("muscle gain")) +
        section(
          "Muscle-gain nutrition (lean bulk)",
          bulletify([
            "Small calorie surplus (usually 200–350 kcal/day).",
            "Protein: ~1.6–2.2 g/kg/day.",
            "Carbs: fuel workouts (especially around training).",
            "Fats: moderate for recovery.",
            "3–5 balanced meals/day.",
          ])
        ) +
        "\n\n" +
        section(
          "Example meals",
          bulletify([
            "Oats + milk/Greek yogurt + banana",
            "Rice + chicken/fish + vegetables",
            "Legumes/eggs + veggies",
            "Protein shake if needed to hit protein target",
          ])
        ) +
        "\n\n" +
        section("1 question", "Do you want a lean bulk (slow) or faster bulk?")
      );
    }

    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(
        "Diet plan basics",
        bulletify([
          "Hit your daily protein target consistently.",
          "Use carbs around workouts for performance.",
          "Choose calorie direction: deficit (loss) / surplus (gain).",
          "Mostly whole foods; limit sugary/ultra-processed snacks.",
        ])
      ) +
      "\n\n" +
      section("2 questions", bulletify(["What’s your goal?", "Any food preferences or allergies?"]))
    );
  }

  // SUPPLEMENTS
  if (/(supplement|supplements|protein|whey|creatine)/.test(t)) {
    if (/creatine/.test(t)) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "Creatine (safe basics)",
          bulletify([
            "Dose: 3–5 g daily (loading not required).",
            "Timing: any time of day; consistency matters most.",
            "Hydration: drink extra water.",
            "What to expect: better strength/training performance after a few weeks.",
            "If you have kidney issues: consult a clinician first.",
          ])
        ) +
        "\n\n" +
        section("1 question", "What’s your goal (strength / muscle gain / general fitness)?")
      );
    }

    if (/protein|whey/.test(t)) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "Whey protein (quick guide)",
          bulletify([
            "Use whey if you struggle to hit protein from food.",
            "Typical scoop: ~20–30 g protein (depends on brand).",
            "Best use: post-workout or anytime to meet your daily protein.",
            "If lactose sensitive: try isolate or lactose-free options.",
            "Supplements help—food quality still matters most.",
          ])
        )
      );
    }

    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(
        "Tell me 2 things",
        bulletify(["Which supplement?", "Your goal (loss / gain / strength)?"])
      )
    );
  }

  // EQUIPMENT USAGE
  if (/(dumbbell|bench|treadmill|squat|deadlift|press|pull-up|lat pulldown|equipment)/.test(t)) {
    if (/dumbbell/.test(t) && /chest|press|bench/.test(t)) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "Dumbbell chest press (safe form)",
          bulletify([
            "Choose bench angle: flat (overall) or incline (upper chest).",
            "Set shoulders: pull shoulder blades back and down.",
            "Wrists stacked, elbows slightly tucked (not flared).",
            "Lower slowly to a comfortable depth, then press smoothly.",
            "Use a weight you can fully control for your target reps.",
          ])
        ) +
        "\n\n" +
        section("2 questions", bulletify(["Flat or incline?", "Target reps (8–12, 12–15, etc.)?"]))
      );
    }

    if (/treadmill/.test(t)) {
      return (
        shortIntro(goalLine(effectiveGoal)) +
        section(
          "Treadmill workout (fat loss + endurance)",
          bulletify([
            "Warm-up: 5 min easy pace.",
            "Intervals: 1 min brisk + 1 min easy × 6–10 rounds.",
            "Posture: tall body, relaxed shoulders, short steps.",
            "Cool-down: 5 min easy pace.",
          ])
        ) +
        "\n\n" +
        section("1 question", "What’s your current fitness level (beginner/intermediate)?")
      );
    }

    return (
      shortIntro(goalLine(effectiveGoal)) +
      section(
        "Tell me what you’re using",
        "Which equipment/exercise (squat, deadlift, bench, etc.)? I’ll give safe form + starter sets/reps."
      )
    );
  }

  // Default: ask follow-up for better answer.
  return (
    shortIntro(goalLine(effectiveGoal)) +
    section(
      "What can I help with?",
      bulletify(["Workouts", "Diet & nutrition", "Supplements", "Equipment form", "Booking slots"])
    ) +
    "\n\n" +
    section("Quick question", "What’s your goal (weight loss / muscle gain / strength / maintenance)?")
  );
}

