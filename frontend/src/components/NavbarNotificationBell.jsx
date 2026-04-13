import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckDouble } from "react-icons/fa";
import {
  GYM_SCHEDULES_API,
  formatNotifAbsolute,
  formatNotifTime,
  gymNotificationsChanged,
  kindLabel,
} from "../utils/gymNotifications.js";

/** Slot tab + `#gym-notifications` (handled in Schedules.jsx). */
const SCHEDULES_GYM_NOTIFICATIONS_URL = "/schedules#gym-notifications";
const MY_GYM_NOTIFICATIONS_PATH = "/my-notifications";

function IconPencil({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function IconClose({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function NavbarNotificationBell({ className = "" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [panelError, setPanelError] = useState("");
  /** Full in-panel view for one notification (list hidden while set). */
  const [detailNotif, setDetailNotif] = useState(null);
  const wrapRef = useRef(null);
  const detailNotifRef = useRef(null);

  const showPanelError = useCallback((message) => {
    setPanelError(message);
    window.setTimeout(() => setPanelError(""), 5000);
  }, []);

  const authHeader = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const fetchCount = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const { data } = await axios.get(`${GYM_SCHEDULES_API}/my-notifications/unread-count`, {
        headers: authHeader(),
      });
      setCount(typeof data?.unreadCount === "number" ? data.unreadCount : 0);
    } catch {
      setCount(0);
    }
  }, []);

  const fetchNotificationList = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${GYM_SCHEDULES_API}/my-notifications`, {
        headers: authHeader(),
        params: { includeRead: "true", limit: 50 },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const sortedItems = useMemo(() => {
    const list = Array.isArray(items) ? [...items] : [];
    list.sort((a, b) => {
      const ua = a.isRead ? 1 : 0;
      const ub = b.isRead ? 1 : 0;
      if (ua !== ub) return ua - ub;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return list;
  }, [items]);

  const unreadInPanel = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  useEffect(() => {
    fetchCount();
    const t = window.setInterval(fetchCount, 45000);
    const onTok = () => fetchCount();
    window.addEventListener("tokenChanged", onTok);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("tokenChanged", onTok);
    };
  }, [fetchCount]);

  useEffect(() => {
    if (open) {
      fetchNotificationList();
      fetchCount();
    }
  }, [open, fetchNotificationList, fetchCount]);

  useEffect(() => {
    const onExternal = () => {
      void fetchCount();
      if (open) void fetchNotificationList();
    };
    window.addEventListener("gymNotificationsChanged", onExternal);
    return () => window.removeEventListener("gymNotificationsChanged", onExternal);
  }, [fetchCount, fetchNotificationList, open]);

  useEffect(() => {
    detailNotifRef.current = detailNotif;
  }, [detailNotif]);

  useEffect(() => {
    if (!open) return undefined;
    const closeIfOutside = (e) => {
      const root = wrapRef.current;
      if (!root || root.contains(e.target)) return;
      setDetailNotif(null);
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (detailNotifRef.current) setDetailNotif(null);
      else setOpen(false);
    };
    document.addEventListener("pointerdown", closeIfOutside, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setPanelError("");
    else setDetailNotif(null);
  }, [open]);

  const goToSchedulesGym = useCallback(() => {
    setOpen(false);
    navigate(SCHEDULES_GYM_NOTIFICATIONS_URL);
  }, [navigate]);

  const goToAllNotificationsPage = useCallback(() => {
    setOpen(false);
    navigate(MY_GYM_NOTIFICATIONS_PATH);
  }, [navigate]);

  const markRead = async (id) => {
    try {
      await axios.put(`${GYM_SCHEDULES_API}/my-notifications/${id}/read`, {}, { headers: authHeader() });
      setItems((prev) =>
        prev.map((x) => (String(x._id) === String(id) ? { ...x, isRead: true } : x)),
      );
      fetchCount();
      gymNotificationsChanged();
      return true;
    } catch {
      showPanelError("Could not mark that notification. Try again.");
      return false;
    }
  };

  const markAllRead = async () => {
    if (unreadInPanel === 0) return;
    setMarkingAll(true);
    setPanelError("");
    try {
      await axios.put(`${GYM_SCHEDULES_API}/my-notifications/read-all`, {}, { headers: authHeader() });
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setCount(0);
      gymNotificationsChanged();
    } catch {
      showPanelError("Could not mark all as read. Check your connection and try again.");
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotificationDetail = async (n) => {
    if (!n.isRead) {
      await markRead(n._id);
    }
    setDetailNotif({ ...n, isRead: true });
  };

  const badge =
    count > 0 ? (
      <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
        {count > 99 ? "99+" : count}
      </span>
    ) : null;

  return (
    <div className={["relative", className].filter(Boolean).join(" ")} ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md shadow-blue-600/25 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          open
            ? "bg-blue-700 ring-2 ring-blue-500 ring-offset-2 dark:bg-blue-600 dark:ring-offset-slate-900"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        }`}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {badge}
      </button>
      {open ? (
        <div
          className="absolute right-0 z-[100] mt-2 w-[min(100vw-1.5rem,400px)] overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/40 to-white text-slate-900 shadow-xl shadow-blue-600/10 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 dark:text-slate-100 dark:shadow-blue-900/25"
          role="dialog"
          aria-label="Notifications panel"
        >
          {panelError ? (
            <p
              className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {panelError}
            </p>
          ) : null}
          <header className="flex items-center justify-between gap-2 border-b border-blue-100/80 px-3 py-3 sm:px-4 dark:border-slate-700">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {detailNotif ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setDetailNotif(null);
                  }}
                  className="inline-flex shrink-0 min-h-9 min-w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                  title="Back to list"
                  aria-label="Back to notifications list"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : null}
              <h2 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {detailNotif ? "Notification" : "Notifications"}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                disabled={unreadInPanel === 0 || markingAll || Boolean(detailNotif)}
                onClick={(e) => {
                  e.preventDefault();
                  void markAllRead();
                }}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-35 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                title="Mark all as read"
                aria-label="Mark all as read"
              >
                <FaCheckDouble className="h-[18px] w-[18px]" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setDetailNotif(null);
                  setOpen(false);
                }}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                title="Close"
                aria-label="Close notifications"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
          </header>

          {detailNotif ? (
            <div
              className="max-h-[min(420px,70vh)] overflow-y-auto overscroll-contain bg-white px-4 py-5 dark:bg-slate-900"
              style={{ scrollbarGutter: "stable" }}
            >
              <div className="flex gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                <IconPencil className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {kindLabel(detailNotif.kind)}
                  </p>
                  <h3 className="mt-1 text-sm font-bold leading-snug text-slate-900 dark:text-slate-50">
                    {detailNotif.message}
                  </h3>
                  <div className="mt-2 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatNotifAbsolute(detailNotif.createdAt) ? (
                      <p>{formatNotifAbsolute(detailNotif.createdAt)}</p>
                    ) : null}
                    {formatNotifTime(detailNotif.createdAt) ? (
                      <p>({formatNotifTime(detailNotif.createdAt)})</p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Details</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{detailNotif.message}</p>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  Manage gym slots and reminders under{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDetailNotif(null);
                      goToSchedulesGym();
                    }}
                    className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Smart Schedules
                  </button>
                  .
                </p>
              </div>
            </div>
          ) : loading ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
          ) : (
            <ul
              className="max-h-[min(420px,70vh)] overflow-y-auto overscroll-contain"
              style={{ scrollbarGutter: "stable" }}
            >
              {sortedItems.map((n) => {
                const unread = !n.isRead;
                const timeStr = formatNotifTime(n.createdAt);
                return (
                  <li
                    key={n._id}
                    className={`border-b border-slate-200/90 last:border-b-0 dark:border-slate-700 ${
                      unread
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-950"
                        : "bg-white/90 dark:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex gap-3 px-4 py-3">
                      <div className="shrink-0 pt-0.5">
                        <IconPencil
                          className={
                            unread
                              ? "text-white/90"
                              : "text-blue-600 dark:text-blue-400"
                          }
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-bold leading-snug ${
                            unread ? "text-white" : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {n.message}
                        </p>
                        {timeStr ? (
                          <p
                            className={`mt-1 text-xs ${
                              unread ? "text-white/85" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {timeStr}
                          </p>
                        ) : null}
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              void openNotificationDetail(n);
                            }}
                            className={`text-xs font-bold underline-offset-2 hover:underline ${
                              unread
                                ? "text-white hover:text-blue-100"
                                : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            }`}
                          >
                            View full notification
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!detailNotif ? (
            <footer className="border-t border-blue-100/80 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goToAllNotificationsPage();
                }}
                className="w-full text-center text-sm font-bold text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                See all
              </button>
            </footer>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
