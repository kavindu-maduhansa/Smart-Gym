import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckDouble } from "react-icons/fa";
import {
  GYM_SCHEDULES_API,
  formatNotifAbsolute,
  formatNotifTime,
  gymNotificationsChanged,
  kindLabel,
} from "../utils/gymNotifications.js";

const SCHEDULES_GYM_NOTIFICATIONS_URL = "/schedules#gym-notifications";

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

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function MyGymNotifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [pageError, setPageError] = useState("");
  const [detailNotif, setDetailNotif] = useState(null);

  const fetchList = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    setLoading(true);
    setPageError("");
    try {
      const { data } = await axios.get(`${GYM_SCHEDULES_API}/my-notifications`, {
        headers: authHeader(),
        params: {
          includeRead: tab === "all" ? "true" : "false",
          limit: 100,
        },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setPageError("Could not load notifications. Try again.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  useEffect(() => {
    const onExternal = () => void fetchList();
    window.addEventListener("gymNotificationsChanged", onExternal);
    return () => window.removeEventListener("gymNotificationsChanged", onExternal);
  }, [fetchList]);

  const sortedItems = useMemo(() => {
    const list = Array.isArray(items) ? [...items] : [];
    if (tab === "all") {
      list.sort((a, b) => {
        const ua = a.isRead ? 1 : 0;
        const ub = b.isRead ? 1 : 0;
        if (ua !== ub) return ua - ub;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return list;
  }, [items, tab]);

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const markRead = async (id) => {
    try {
      await axios.put(`${GYM_SCHEDULES_API}/my-notifications/${id}/read`, {}, { headers: authHeader() });
      setItems((prev) => {
        if (tab === "unread") {
          return prev.filter((x) => String(x._id) !== String(id));
        }
        return prev.map((x) => (String(x._id) === String(id) ? { ...x, isRead: true } : x));
      });
      gymNotificationsChanged();
      return true;
    } catch {
      setPageError("Could not mark that notification. Try again.");
      window.setTimeout(() => setPageError(""), 5000);
      return false;
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    setPageError("");
    try {
      await axios.put(`${GYM_SCHEDULES_API}/my-notifications/read-all`, {}, { headers: authHeader() });
      setItems((prev) => (tab === "unread" ? [] : prev.map((x) => ({ ...x, isRead: true }))));
      gymNotificationsChanged();
    } catch {
      setPageError("Could not mark all as read. Try again.");
      window.setTimeout(() => setPageError(""), 5000);
    } finally {
      setMarkingAll(false);
    }
  };

  const openDetail = async (n) => {
    if (!n.isRead) await markRead(n._id);
    setDetailNotif({ ...n, isRead: true });
  };

  useEffect(() => {
    setDetailNotif(null);
  }, [tab]);

  return (
    <div className="page-bg-base relative px-6 pt-24">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-slate-100/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">Gym notifications</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Booking updates, reminders, and waitlist messages from Smart Schedules.
            </p>
            <Link
              to="/"
              className="mt-3 inline-block text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
              aria-label="Back to home"
            >
              ← Back
            </Link>
          </div>
          <button
            type="button"
            disabled={unreadCount === 0 || markingAll}
            onClick={() => void markAllRead()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
          >
            <FaCheckDouble className="h-4 w-4" aria-hidden />
            Mark all read
          </button>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            className={`rounded-t-lg border px-5 py-2 text-base font-bold transition-colors duration-200 ${
              tab === "all"
                ? "border-blue-600/50 bg-blue-600 text-white dark:border-blue-500/50"
                : "border-slate-300 bg-slate-100 text-slate-900 hover:border-blue-600/50 hover:bg-white/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => setTab("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`rounded-t-lg border px-5 py-2 text-base font-bold transition-colors duration-200 ${
              tab === "unread"
                ? "border-blue-600/50 bg-blue-600 text-white dark:border-blue-500/50"
                : "border-slate-300 bg-slate-100 text-slate-900 hover:border-blue-600/50 hover:bg-white/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => setTab("unread")}
          >
            Unread
          </button>
        </div>

        {pageError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {pageError}
          </p>
        ) : null}

        {detailNotif ? (
          <div className="rounded-xl border border-blue-100/80 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setDetailNotif(null)}
              className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-md text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              <span aria-hidden>←</span> Back to list
            </button>
            <div className="flex gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
              <IconPencil className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {kindLabel(detailNotif.kind)}
                </p>
                <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900 dark:text-slate-50">
                  {detailNotif.message}
                </h2>
                <div className="mt-2 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {formatNotifAbsolute(detailNotif.createdAt) ? <p>{formatNotifAbsolute(detailNotif.createdAt)}</p> : null}
                  {formatNotifTime(detailNotif.createdAt) ? <p>({formatNotifTime(detailNotif.createdAt)})</p> : null}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{detailNotif.message}</p>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Manage gym slots under{" "}
              <button
                type="button"
                onClick={() => navigate(SCHEDULES_GYM_NOTIFICATIONS_URL)}
                className="font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                Smart Schedules (Slot Availability)
              </button>
              .
            </p>
          </div>
        ) : loading ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">Loading…</p>
        ) : sortedItems.length === 0 ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">
            {tab === "unread" ? "No unread notifications." : "No notifications yet."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {sortedItems.map((n) => {
              const unread = !n.isRead;
              const timeStr = formatNotifTime(n.createdAt);
              return (
                <li
                  key={n._id}
                  className={
                    unread
                      ? "bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-950"
                      : "bg-white dark:bg-slate-900/80"
                  }
                >
                  <div className="flex gap-3 px-4 py-4">
                    <div className="shrink-0 pt-0.5">
                      <IconPencil
                        className={unread ? "text-white/90" : "text-blue-600 dark:text-blue-400"}
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
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
                        {unread ? (
                          <button
                            type="button"
                            onClick={() => void markRead(n._id)}
                            className="text-xs font-bold text-white/95 underline-offset-2 hover:underline"
                          >
                            Mark read
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void openDetail(n)}
                          className={`text-xs font-bold underline-offset-2 hover:underline ${
                            unread
                              ? "text-white hover:text-blue-100"
                              : "text-blue-600 dark:text-blue-400"
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
      </div>
    </div>
  );
}
