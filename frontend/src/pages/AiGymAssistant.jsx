import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SESSION_STORAGE_PREFIX = "smartgym_ai_session_";

function safeRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function FloatingAiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a4 4 0 0 1-4 4H8l-4 3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" />
      <circle cx="9" cy="11" r="1" />
      <circle cx="12" cy="11" r="1" />
      <circle cx="15" cy="11" r="1" />
    </svg>
  );
}

const QUICK_PROMPTS = [
  "Give me a beginner full-body workout plan.",
  "Suggest a simple diet plan for weight loss.",
  "What should I eat before and after my gym workout?",
  "How to use dumbbells safely for chest workout?",
  "Injury Prevention Mode: create a safe warm-up + recovery plan.",
  "Exercise Form Guide: teach me proper squat form.",
  "Smart Recommendations: suggest the best low-crowd workout times and a plan for my goal.",
];

function formatSlotsForUI(toolResult) {
  if (!toolResult) return "";
  if (toolResult.kind === "available_slots" && Array.isArray(toolResult.slots)) {
    return toolResult.slots
      .map((s) => `• ${s.title} (${s.date} • ${s.time})`)
      .join("\n");
  }
  if (toolResult.kind === "my_bookings_need_slot_id" && Array.isArray(toolResult.bookings)) {
    return toolResult.bookings
      .map((s) => `• ${s.title} (${s.date} • ${s.time})`)
      .join("\n");
  }
  if ((toolResult.kind === "booked" || toolResult.kind === "cancelled") && toolResult.slot) {
    return `Booked/Cancelled: ${toolResult.slot.title} (${toolResult.slot.date} • ${toolResult.slot.time})`;
  }
  if (toolResult.kind === "booking_error" || toolResult.kind === "cancel_error" || toolResult.kind === "booking_error") {
    return toolResult.error ? `• ${toolResult.error}` : "";
  }
  return "";
}

const AiGymAssistant = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [input, setInput] = useState("");
  const [chat, setChat] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! Ask me gym-related questions (workouts, diet, supplements, equipment, or bookings). I’ll ask 1–2 follow-up questions when needed.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [slotsText, setSlotsText] = useState("");
  const [error, setError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historySessions, setHistorySessions] = useState([]);
  const [memory, setMemory] = useState({
    goal: "",
    level: "",
    daysPerWeek: null,
    injuries: "",
    equipment: [],
    preferences: "",
  });
  const [gamification, setGamification] = useState({
    points: 0,
    streakDays: 0,
    badges: [],
  });

  const token = useMemo(() => localStorage.getItem("token"), []);
  const payload = useMemo(() => (token ? parseJwt(token) : null), [token]);
  const userId = payload?.id || null;

  const [sessionId, setSessionId] = useState(null);

  const startNewChat = () => {
    if (!userId) {
      setError("Please login to start a new chat.");
      return;
    }
    const key = `${SESSION_STORAGE_PREFIX}${userId}`;
    const newId = safeRandomId();
    localStorage.setItem(key, newId);
    setSessionId(newId);
    setInput("");
    setSlotsText("");
    setError("");
    setChat([
      {
        id: "welcome",
        sender: "bot",
        text: "Hi! Ask me gym-related questions (workouts, diet, supplements, equipment, or bookings). I’ll ask 1–2 follow-up questions when needed.",
      },
    ]);
    setTimeout(() => inputRef.current?.focus?.(), 50);
  };

  // Ensure we always have a sessionId for this logged-in user.
  useEffect(() => {
    if (!userId) return;
    if (sessionId) return;
    const key = `${SESSION_STORAGE_PREFIX}${userId}`;
    const existing = localStorage.getItem(key);
    if (existing) {
      setSessionId(existing);
      return;
    }
    const newId = safeRandomId();
    localStorage.setItem(key, newId);
    setSessionId(newId);
  }, [userId, sessionId]);

  const loadHistorySessions = async () => {
    if (!payload?.role) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await fetch(`${API_URL}/chat/history/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load history");
      setHistorySessions(data?.sessions || []);
    } catch (e) {
      setHistoryError(e?.message || "Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistorySession = async (sid) => {
    if (!sid) return;
    setLoading(true);
    setError("");
    setSlotsText("");
    try {
      const res = await fetch(`${API_URL}/chat/history/sessions/${sid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load session");

      const key = `${SESSION_STORAGE_PREFIX}${userId}`;
      localStorage.setItem(key, sid);
      setSessionId(sid);

      if (data?.session) {
        setMemory({
          goal: data.session.goal || "",
          level: data.session.level || "",
          daysPerWeek: data.session.daysPerWeek ?? null,
          injuries: data.session.injuries || "",
          equipment: data.session.equipment || [],
          preferences: data.session.preferences || "",
        });
        setGamification({
          points: data.session.points || 0,
          streakDays: data.session.streakDays || 0,
          badges: data.session.badges || [],
        });
      }

      const rebuilt = [
        {
          id: "welcome",
          sender: "bot",
          text: "Loaded chat history. You can continue the conversation below.",
        },
      ];

      for (const t of data?.turns || []) {
        rebuilt.push({ id: `${t.createdAt}_u`, sender: "user", text: t.userMessage });
        rebuilt.push({ id: `${t.createdAt}_b`, sender: "bot", text: t.assistantReply });
      }
      setChat(rebuilt);
      setTimeout(() => inputRef.current?.focus?.(), 50);
    } catch (e) {
      // If a session id exists in localStorage but doesn't exist in DB yet,
      // don't show an error on refresh. The session will be created on first message.
      const msg = String(e?.message || "");
      if (msg.toLowerCase().includes("chat session not found")) {
        return;
      }
      setError(msg || "Failed to open session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistorySessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On refresh (or sessionId change), restore conversation if it exists.
  // If the session doesn't exist yet (fresh session id), we keep the welcome message.
  useEffect(() => {
    if (!payload?.role) return;
    if (!sessionId) return;
    void openHistorySession(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, payload?.role]);

  const sendMessage = async (messageText) => {
    if (!payload?.role) {
      setError("Please login to use the chatbot.");
      return;
    }
    if (!sessionId) {
      setError("Chat session not ready yet. Please try again.");
      return;
    }

    const trimmed = (messageText || "").trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setSlotsText("");
    setChat((c) => [
      ...c,
      { id: `${Date.now()}_${Math.random()}`, sender: "user", text: trimmed },
    ]);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          sessionId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Chat API failed");

      const replyText = data?.reply || "No response.";
      setChat((c) => [
        ...c,
        { id: `${Date.now()}_${Math.random()}`, sender: "bot", text: replyText },
      ]);
      if (data?.memory) setMemory(data.memory);
      if (data?.gamification) setGamification(data.gamification);
      const slotBlock = formatSlotsForUI(data?.toolResult);
      if (slotBlock) setSlotsText(slotBlock);
    } catch (e) {
      setError(e?.message || "Failed to get response.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  const handleQuickPrompt = async (prompt) => {
    await sendMessage(prompt);
  };

  const handleFloatButton = () => {
    inputRef.current?.focus?.();
    inputRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="page-bg-base pt-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-100/80 p-4 shadow-lg sm:p-5 dark:border-slate-600 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 dark:border-blue-500/40 dark:bg-blue-950/90">
                <span className="font-black text-blue-700 dark:text-blue-400">AI</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-blue-700 sm:text-2xl dark:text-blue-400">
                  AI Gym Assistant
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-200">
                  Ask about workouts, diet plans, meals, equipment usage, recovery, and booking guidance.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  if (!payload?.role) navigate("/login");
                  handleFloatButton();
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700/90"
              >
                Ask Now
              </button>
              <button
                onClick={startNewChat}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-bold text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left: Question & response */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg sm:p-6 dark:border-slate-600 dark:bg-slate-900/95">
              <div className="mb-3 font-bold text-slate-900 dark:text-slate-100">Your question</div>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.shiftKey) return;
                  e.preventDefault();
                  if (loading || !input.trim()) return;
                  void handleAsk();
                }}
                rows={5}
                placeholder="Example: Give me a beginner workout plan for weight loss."
                className="w-full rounded-xl border border-slate-200 bg-blue-50/40 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600 sm:text-base dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-500"
                disabled={loading}
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleAsk}
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-extrabold text-white transition hover:bg-blue-700/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Asking..." : "Ask Assistant"}
                </button>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="block">Press Enter to send · Shift+Enter for a new line.</span>
                  <span className="block">Note: AI is for guidance only. Replies are gym/fitness topics.</span>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Response</div>
                <div className="min-h-[220px] max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-blue-50/30 p-4 text-sm leading-relaxed text-slate-900 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100">
                  {chat.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-2 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap",
                          m.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100",
                        ].join(" ")}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {loading ? (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">Assistant is typing...</div>
                  ) : null}
                  {slotsText ? (
                    <div className="mt-3 text-slate-800 dark:text-slate-200">
                      <div className="mb-1 font-bold text-blue-600 dark:text-blue-400">Slots info:</div>
                      <div className="whitespace-pre-wrap">{slotsText}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-800 dark:border-red-500/35 dark:bg-red-950/50 dark:text-red-200">
                  {error}
                </div>
              ) : null}
            </div>

            {/* What you can ask (moved below conversation) */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg sm:p-6 dark:border-slate-600 dark:bg-slate-900/95">
              <div className="mb-2 font-bold text-slate-900 dark:text-slate-100">What you can ask</div>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/80">
                    <div className="mb-1 text-xs font-bold text-slate-900 dark:text-slate-100">Workout & plans</div>
                    <div className="text-[12px] text-slate-600 dark:text-slate-400">
                      “Beginner plan for weight loss”, “2 days/week workout split”
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/80">
                    <div className="mb-1 text-xs font-bold text-slate-900 dark:text-slate-100">Diet & nutrition</div>
                    <div className="text-[12px] text-slate-600 dark:text-slate-400">
                      “Meal plan for muscle gain”, “What to eat before/after gym”
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/80">
                    <div className="mb-1 text-xs font-bold text-slate-900 dark:text-slate-100">BMI / goals</div>
                    <div className="text-[12px] text-slate-600 dark:text-slate-400">
                      “Calculate BMI for 70kg and 170cm”, “I want to lose 20kg”
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/80">
                    <div className="mb-1 text-xs font-bold text-slate-900 dark:text-slate-100">Form & injury prevention</div>
                    <div className="text-[12px] text-slate-600 dark:text-slate-400">
                      “Squat form guide”, “My knee hurts when squatting”
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2 dark:border-slate-600 dark:bg-slate-800/80">
                    <div className="mb-1 text-xs font-bold text-slate-900 dark:text-slate-100">Bookings</div>
                    <div className="text-[12px] text-slate-600 dark:text-slate-400">
                      “Show available slots”, “Book slot &lt;id&gt;”, “Cancel slot &lt;id&gt;”
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Calculate BMI for 70kg and 170cm",
                  "Squat form guide",
                  "Show available slots",
                  "Smart recommendations for my goal",
                ].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => handleQuickPrompt(ex)}
                    disabled={loading}
                    className="rounded-full border border-blue-600/35 bg-blue-600/10 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-600/20 disabled:opacity-60 dark:border-blue-400/40 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    title="Click to send"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quick prompts & tips */}
          <div className="md:col-span-1">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg dark:border-slate-600 dark:bg-slate-900/95">
                <div className="mb-3 font-bold text-slate-900 dark:text-slate-100">Quick prompts</div>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleQuickPrompt(p)}
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:bg-slate-100 disabled:opacity-60 sm:text-sm dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-700/90"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg dark:border-slate-600 dark:bg-slate-900/95">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-slate-100">History</div>
                  <button
                    onClick={loadHistorySessions}
                    disabled={historyLoading}
                    className="text-xs font-bold text-blue-600 hover:text-blue-500 disabled:opacity-60 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Refresh
                  </button>
                </div>
                {historyError ? (
                  <div className="text-xs text-red-700 dark:text-red-300">{historyError}</div>
                ) : historyLoading ? (
                  <div className="text-xs text-slate-600 dark:text-slate-400">Loading history...</div>
                ) : historySessions.length === 0 ? (
                  <div className="text-xs text-slate-600 dark:text-slate-400">No previous chats yet.</div>
                ) : (
                  <div className="max-h-[180px] space-y-2 overflow-auto pr-1">
                    {historySessions.map((s) => (
                      <button
                        key={s.sessionId}
                        onClick={() => openHistorySession(s.sessionId)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/90 dark:hover:bg-slate-700/80"
                      >
                        <div className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                          {s.lastUserMessage ? s.lastUserMessage : "Chat session"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                          {s.goal ? `Goal: ${s.goal} • ` : ""}
                          {s.lastAt ? new Date(s.lastAt).toLocaleString() : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg dark:border-slate-600 dark:bg-slate-900/95">
                <div className="mb-2 font-bold text-slate-900 dark:text-slate-100">Tips</div>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                  <li>Mention your goal (fat loss, muscle gain, or stamina).</li>
                  <li>Add your level (beginner/intermediate/advanced).</li>
                  <li>Ask specific questions for better answers.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-lg dark:border-slate-600 dark:bg-slate-900/95">
                <div className="mb-2 font-bold text-slate-900 dark:text-slate-100">Safety reminder</div>
                <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  Follow proper form, avoid sudden heavy loading, and consult professionals for medical conditions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating icon button (bottom-right) */}
      <button
        onClick={handleFloatButton}
        className="fixed bottom-5 right-5 z-[100] w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700/90 transition flex items-center justify-center"
        aria-label="Focus chatbot input"
      >
        <FloatingAiIcon />
      </button>
    </div>
  );
};

export default AiGymAssistant;


