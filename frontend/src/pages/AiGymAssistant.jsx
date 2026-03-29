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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 pt-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-6 bg-gradient-to-r from-blue-600/30 via-black to-blue-50 border border-blue-600/20 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                <span className="text-blue-600 font-black">AI</span>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-blue-600">
                  AI Gym Assistant
                </div>
                <div className="text-xs sm:text-sm text-slate-900/70 mt-1">
                  Ask about workouts, diet plans, meals, equipment usage, recovery, and booking guidance.
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  if (!payload?.role) navigate("/login");
                  handleFloatButton();
                }}
                className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-700/90 transition"
              >
                Ask Now
              </button>
              <button
                onClick={startNewChat}
                className="bg-slate-50 border border-slate-200 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left: Question & response */}
          <div className="md:col-span-2">
            <div className="bg-white/70 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-slate-900/90 font-bold mb-3">Your question</div>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                placeholder="Example: Give me a beginner workout plan for weight loss."
                className="w-full bg-blue-50/40 border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-900/40 outline-none focus:border-blue-600 transition"
                disabled={loading}
              />

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleAsk}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold px-5 py-2 rounded-xl hover:bg-blue-700/90 transition"
                >
                  {loading ? "Asking..." : "Ask Assistant"}
                </button>
                <div className="text-xs text-slate-900/50">
                  Replies are restricted to gym/fitness only.
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs text-slate-900/50 mb-2">Conversation</div>
                <div className="bg-blue-50/30 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed text-slate-900/90 min-h-[220px] max-h-[360px] overflow-auto">
                  {chat.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} mb-2`}
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap",
                          m.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-50 text-slate-900 border border-slate-200",
                        ].join(" ")}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {loading ? (
                    <div className="text-slate-900/60 text-xs mt-2">Assistant is typing...</div>
                  ) : null}
                  {slotsText ? (
                    <div className="mt-3 text-slate-900/70">
                      <div className="font-bold text-blue-600 mb-1">Slots info:</div>
                      <div className="whitespace-pre-wrap">{slotsText}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              {error ? (
                <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {error}
                </div>
              ) : null}
            </div>

            {/* What you can ask (moved below conversation) */}
            <div className="mt-4 bg-white/70 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-slate-900/90 font-bold mb-2">What you can ask</div>
              <div className="text-slate-900/70 text-sm space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-slate-900 font-bold text-xs mb-1">Workout & plans</div>
                    <div className="text-[12px] text-slate-900/60">
                      “Beginner plan for weight loss”, “2 days/week workout split”
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-slate-900 font-bold text-xs mb-1">Diet & nutrition</div>
                    <div className="text-[12px] text-slate-900/60">
                      “Meal plan for muscle gain”, “What to eat before/after gym”
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-slate-900 font-bold text-xs mb-1">BMI / goals</div>
                    <div className="text-[12px] text-slate-900/60">
                      “Calculate BMI for 70kg and 170cm”, “I want to lose 20kg”
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-slate-900 font-bold text-xs mb-1">Form & injury prevention</div>
                    <div className="text-[12px] text-slate-900/60">
                      “Squat form guide”, “My knee hurts when squatting”
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:col-span-2">
                    <div className="text-slate-900 font-bold text-xs mb-1">Bookings</div>
                    <div className="text-[12px] text-slate-900/60">
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
                    className="px-3 py-2 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-600 text-xs font-bold hover:bg-blue-700/15 transition"
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
              <div className="bg-white/70 border border-slate-200 rounded-2xl p-4 shadow-lg">
                <div className="text-slate-900/90 font-bold mb-3">Quick Prompts</div>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleQuickPrompt(p)}
                      disabled={loading}
                      className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-xs sm:text-sm"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/70 border border-slate-200 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-slate-900/90 font-bold">History</div>
                  <button
                    onClick={loadHistorySessions}
                    disabled={historyLoading}
                    className="text-xs font-bold text-blue-600 hover:text-blue-600/80 disabled:opacity-60"
                  >
                    Refresh
                  </button>
                </div>
                {historyError ? (
                  <div className="text-xs text-red-300">{historyError}</div>
                ) : historyLoading ? (
                  <div className="text-xs text-slate-900/60">Loading history...</div>
                ) : historySessions.length === 0 ? (
                  <div className="text-xs text-slate-900/60">No previous chats yet.</div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-auto pr-1">
                    {historySessions.map((s) => (
                      <button
                        key={s.sessionId}
                        onClick={() => openHistorySession(s.sessionId)}
                        className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                      >
                        <div className="text-xs text-slate-900 font-bold truncate">
                          {s.lastUserMessage ? s.lastUserMessage : "Chat session"}
                        </div>
                        <div className="text-[11px] text-slate-900/50 mt-0.5">
                          {s.goal ? `Goal: ${s.goal} • ` : ""}
                          {s.lastAt ? new Date(s.lastAt).toLocaleString() : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white/70 border border-slate-200 rounded-2xl p-4 shadow-lg">
                <div className="text-slate-900/90 font-bold mb-2">Tips</div>
                <ul className="list-disc pl-5 text-slate-900/70 text-sm space-y-2">
                  <li>Mention your goal (fat loss, muscle gain, or stamina).</li>
                  <li>Add your level (beginner/intermediate/advanced).</li>
                  <li>Ask specific questions for better answers.</li>
                </ul>
              </div>

              <div className="bg-white/70 border border-slate-200 rounded-2xl p-4 shadow-lg">
                <div className="text-slate-900/90 font-bold mb-2">Safety Reminder</div>
                <div className="text-slate-900/70 text-sm leading-relaxed">
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


