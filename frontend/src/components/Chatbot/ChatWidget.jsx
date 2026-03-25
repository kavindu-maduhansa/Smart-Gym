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

function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-6v-7H10v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a4 4 0 0 1-4 4H8l-4 3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" />
      <circle cx="9" cy="11" r="1" />
      <circle cx="14" cy="11" r="1" />
      <circle cx="11.5" cy="11" r="1" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 0 20" />
      <path d="M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function ChatMessage({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={[
          "max-w-[90%] rounded-2xl px-3 py-2 text-xs sm:text-sm whitespace-pre-wrap",
          isUser ? "bg-orange text-black" : "bg-white/5 text-white border border-white/10",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");

  const [tokenRole, setTokenRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const sessionId = useMemo(() => {
    const payload = token ? parseJwt(token) : null;
    const id = payload?.id || null;
    if (!id) return null;
    const key = `${SESSION_STORAGE_PREFIX}${id}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const newId = safeRandomId();
    localStorage.setItem(key, newId);
    return newId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const [toolSlots, setToolSlots] = useState([]); // array of { _id,title,date,time,trainer }
  const [toolMode, setToolMode] = useState("available"); // "available" | "myBookings"

  useEffect(() => {
    if (!token) return;
    const payload = parseJwt(token);
    if (!payload) return;
    setTokenRole(payload.role || null);
    setUserId(payload.id || null);
  }, [token]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus?.(), 50);
  }, [open]);

  async function callChat(messageText) {
    if (!token || !sessionId) throw new Error("Please login to use the AI assistant.");

    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageText, sessionId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Chat failed.");
    return data;
  }

  function fillToolFromToolResult(toolResult) {
    if (!toolResult || !toolResult.kind) return;

    if (toolResult.kind === "available_slots" && Array.isArray(toolResult.slots)) {
      setToolMode("available");
      setToolSlots(toolResult.slots);
      return;
    }

    if (
      toolResult.kind === "needs_slot_id" &&
      Array.isArray(toolResult.slots)
    ) {
      setToolMode("available");
      setToolSlots(toolResult.slots);
      return;
    }

    if (
      toolResult.kind === "my_bookings_need_slot_id" &&
      Array.isArray(toolResult.bookings)
    ) {
      setToolMode("myBookings");
      setToolSlots(toolResult.bookings);
      return;
    }
  }

  async function send(text) {
    const trimmed = (text || "").trim();
    if (!trimmed || typing) return;

    if (!token || !sessionId) {
      setError("Please login to use the AI assistant.");
      return;
    }

    setError("");
    setToolSlots([]);
    setToolMode("available");

    setTyping(true);
    const userMessage = { id: safeRandomId(), sender: "user", text: trimmed };
    setMessages((m) => [...m, userMessage]);

    try {
      const data = await callChat(trimmed);
      const botText = data?.reply || "No response.";
      const botMessage = { id: safeRandomId(), sender: "bot", text: botText };
      setMessages((m) => [...m, botMessage]);
      fillToolFromToolResult(data?.toolResult);
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setTyping(false);
    }
  }

  async function quickSend(action) {
    if (action === "workout") return send("Give me a workout plan. Use my goal from our chat if available. Ask 1-2 follow-up questions.");
    if (action === "diet") return send("Create a diet plan for my goal. Use my goal from our chat if available. Ask 1-2 follow-up questions. Use bullet points.");
    if (action === "book") return send("Show available slots");
    if (action === "cancel") return send("Cancel my booking");
  }

  function handleSlotAction(slotId) {
    if (toolMode === "available") return send(`Book slot ${slotId}`);
    return send(`Cancel slot ${slotId}`);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => navigate("/ai-gym-assistant")}
          className="fixed bottom-5 right-5 z-[100] w-14 h-14 rounded-full bg-orange text-black font-black shadow-2xl hover:bg-orange/90 transition flex items-center justify-center border border-orange/30"
          aria-label="Open AI assistant"
        >
          <IconChat />
        </button>
      )}

      {/* Full-screen overlay like the screenshot */}
      {open && (
        <div className="fixed inset-0 z-[120] bg-black/40">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
            {/* Top orange bar */}
            <div className="bg-orange">
              <div className="px-4 py-3 flex items-center justify-between">
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-xl bg-orange/20 border border-orange/40 text-black flex items-center justify-center text-lg font-bold"
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="text-black font-extrabold tracking-wide text-lg sm:text-xl">
                  AI GYM ASSISTANT
                </div>
                <div className="w-9 h-9 rounded-xl bg-orange/20 border border-orange/40 flex items-center justify-center">
                  <IconUser />
                </div>
              </div>
            </div>

            <div className="px-4 pt-4 pb-28">
              {/* Main header card */}
              <div className="bg-gray-900/70 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-white/80 text-sm font-bold">Good Afternoon</div>
                      <div className="text-white text-lg font-extrabold">Smart Gym Member</div>
                      <div className="mt-2 text-white/60 text-xs">
                        Ask for workouts, diet, supplements, equipment usage, and booking guidance.
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white font-extrabold text-sm">
                        {tokenRole === "admin" ? "ADMIN" : tokenRole === "trainer" ? "TRAINER" : "PLATINUM"}
                      </div>
                      <button
                        onClick={() => inputRef.current?.focus?.()}
                        className="px-5 py-3 rounded-2xl bg-orange text-black font-extrabold hover:bg-orange/90 transition"
                      >
                        RECHARGE
                      </button>
                    </div>
                  </div>

                  {/* Quick buttons row */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => quickSend("book")}
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs"
                    >
                      Book Slot
                    </button>
                    <button
                      onClick={() => quickSend("cancel")}
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs"
                    >
                      Cancel Booking
                    </button>
                    <button
                      onClick={() => quickSend("diet")}
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs"
                    >
                      Diet Plan
                    </button>
                    <button
                      onClick={() => quickSend("workout")}
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs"
                    >
                      Workout Plan
                    </button>
                  </div>

                  {/* Info cards */}
                  <div className="mt-5 space-y-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-extrabold">Loyalty</div>
                        <div className="text-white/90 font-extrabold">AI Points</div>
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-[55%] bg-orange rounded-full" />
                      </div>
                      <div className="mt-2 text-white/60 text-xs">
                        Earn points by asking and booking via chat.
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-extrabold">Anytime Data</div>
                        <div className="text-orange font-extrabold">Best Hours</div>
                      </div>
                      <div className="mt-2 text-white/70 text-xs">
                        Try workouts in <span className="text-white font-bold">early morning</span> or{" "}
                        <span className="text-white font-bold">late evening</span> for less crowd.
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-extrabold">Night Time Data</div>
                        <div className="text-orange font-extrabold">Recovery</div>
                      </div>
                      <div className="mt-2 text-white/70 text-xs">
                        Post-workout: protein + carbs, hydrate, and do light stretching.
                      </div>
                    </div>
                  </div>

                  {/* Slots list (if toolResult returned) */}
                  {toolSlots.length > 0 && (
                    <div className="mt-4 bg-black/30 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-extrabold">
                          {toolMode === "available" ? "Available Slots" : "Your Bookings"}
                        </div>
                        <button
                          onClick={() => setToolSlots([])}
                          className="text-white/60 hover:text-orange text-xs font-bold"
                        >
                          Hide
                        </button>
                      </div>
                      <div className="mt-3 space-y-2 max-h-[180px] overflow-auto pr-1">
                        {toolSlots.map((s) => (
                          <div
                            key={s._id}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl"
                          >
                            <div className="text-white font-bold text-sm">{s.title}</div>
                            <div className="text-white/60 text-[11px] mt-1">
                              {s.trainer ? `Trainer: ${s.trainer} • ` : ""}
                              {s.date} • {s.time}
                            </div>
                            <button
                              onClick={() => handleSlotAction(s._id)}
                              className={
                                toolMode === "available"
                                  ? "mt-2 w-full bg-orange text-black font-extrabold px-3 py-2 rounded-xl text-xs hover:bg-orange/90 transition"
                                  : "mt-2 w-full bg-white/5 hover:bg-white/10 text-orange font-extrabold px-3 py-2 rounded-xl text-xs border border-orange/30 transition"
                              }
                            >
                              {toolMode === "available" ? "Book via Chat" : "Cancel via Chat"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat area */}
              <div className="mt-4 bg-gray-900/70 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="text-white font-extrabold">Chat</div>
                  <div className="text-white/60 text-xs mt-1">
                    Gym-only assistant. Use booking buttons for slots.
                  </div>
                </div>
                <div className="p-4 max-h-[200px] overflow-auto">
                  {messages.length === 0 ? (
                    <div className="text-white/60 text-sm">Ask anything gym-related to start.</div>
                  ) : (
                    messages.map((m) => (
                      <ChatMessage key={m.id} sender={m.sender} text={m.text} />
                    ))
                  )}
                  {typing && (
                    <div className="text-white/60 text-xs mt-1">Assistant is typing...</div>
                  )}
                </div>
                {error && (
                  <div className="px-4 pb-3">
                    <div className="text-red-200 bg-red-500/10 border border-red-500/30 text-xs rounded-xl p-3">
                      {error}
                    </div>
                  </div>
                )}
                <div className="p-4 border-t border-white/10">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = input;
                      setInput("");
                      void send(text);
                    }}
                  >
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about workouts, diet, supplements, equipment, or bookings..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-orange transition"
                      />
                      <button
                        type="submit"
                        disabled={typing}
                        className="w-12 rounded-2xl bg-orange hover:bg-orange/90 text-black font-extrabold transition disabled:opacity-60"
                        aria-label="Send"
                      >
                        →
                      </button>
                    </div>
                    <div className="text-white/40 text-[10px] mt-2">
                      Replies are limited to gym topics only.
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom navigation (UI only inside overlay) */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-around px-2 py-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/");
                  }}
                  className="flex flex-col items-center gap-1 text-white/70 hover:text-orange transition"
                >
                  <IconHome />
                  <div className="text-[10px] font-bold">Home</div>
                </button>
                <button
                  onClick={() => {
                    // Focus chat input inside overlay
                    inputRef.current?.focus?.();
                  }}
                  className="flex flex-col items-center gap-1 text-orange font-bold"
                >
                  <IconChat />
                  <div className="text-[10px] font-bold">AI</div>
                </button>
                <button
                  onClick={() => {
                    quickSend("book");
                  }}
                  className="flex flex-col items-center gap-1 text-white/70 hover:text-orange transition"
                >
                  <IconCalendar />
                  <div className="text-[10px] font-bold">Offers</div>
                </button>
                <button
                  onClick={() => {
                    quickSend("diet");
                  }}
                  className="flex flex-col items-center gap-1 text-white/70 hover:text-orange transition"
                >
                  <IconGlobe />
                  <div className="text-[10px] font-bold">International</div>
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/contact");
                  }}
                  className="flex flex-col items-center gap-1 text-white/70 hover:text-orange transition"
                >
                  <IconBolt />
                  <div className="text-[10px] font-bold">Help</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

