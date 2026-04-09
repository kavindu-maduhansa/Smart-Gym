import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        setUser(response.data);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getMembershipStatus = () => {
    if (!user || !user.membershipExpiry) return "Unknown";
    const expiryDate = new Date(user.membershipExpiry);
    const today = new Date();
    return expiryDate > today ? "Active" : "Expired";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="page-bg-base pt-24 flex items-center justify-center px-4">
        <div className="marketing-panel w-full max-w-md p-10 text-center">
          <div
            className="mx-auto mb-4 h-11 w-11 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"
            aria-hidden
          />
          <p className="text-slate-800 font-semibold">Loading your dashboard…</p>
          <p className="mt-2 text-sm text-slate-600">Fetching membership and profile details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-bg-base pt-24 flex items-center justify-center px-4">
        <div className="marketing-panel w-full max-w-lg border-red-200 bg-red-50/50 p-8 text-center">
          <p className="text-red-800 font-semibold text-lg">Something went wrong</p>
          <p className="mt-2 text-sm text-red-900/80">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ui-btn-primary mt-6"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const membershipStatus = getMembershipStatus();
  const isExpired = membershipStatus === "Expired";

  return (
    <div className="page-bg-base overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 ambient-gradient"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="dashboard-hero mb-8">
            <p className="section-kicker mb-2">Member hub</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
              Your membership, bookings, and plans in one place—pick a shortcut below to continue.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-blue-200">
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-2">
                  Membership type
                </p>
                <p className="text-slate-900 text-lg sm:text-xl font-bold capitalize">
                  {user?.membershipType || "None"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-blue-200">
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-2">
                  Expiry date
                </p>
                <p className="text-slate-900 text-lg sm:text-xl font-bold">
                  {formatDate(user?.membershipExpiry)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-blue-200">
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mb-2">Status</p>
                <p className={`text-lg sm:text-xl font-bold ${isExpired ? "text-red-700" : "text-blue-600"}`}>
                  {membershipStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Alert for Expired Membership */}
          {isExpired && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-bold text-lg sm:text-xl mb-2 text-slate-900">Membership expired</p>
                  <p className="text-sm sm:text-base text-slate-600 mb-5 leading-relaxed">
                    Renew to keep booking sessions and accessing member perks.
                  </p>
                  <button type="button" onClick={() => navigate("/membership")} className="ui-btn-primary w-full sm:w-auto">
                    Request renewal
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Shortcuts</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Jump to the tools you use most.</p>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: "My Profile", desc: "View personal information", link: "/profile" },
              { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", title: "Membership", desc: "View membership details", link: "/membership" },
              { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", title: "My Plans", desc: "View training & meal plans", link: "/my-plans" },
              { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", title: "My Bookings", desc: "View your bookings", link: "/my-bookings" },
              { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", title: "My settings", desc: "Account & sign-in details", link: "/my-settings" }
            ].map((item, idx) => {
              const isSettings = item.link === "/my-settings";
              return (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(item.link)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(item.link);
                    }
                  }}
                  aria-label={isSettings ? "Open my settings for your account" : `${item.title}: ${item.desc}`}
                  className={
                    isSettings
                      ? "group cursor-pointer rounded-2xl border-2 border-blue-200/90 bg-gradient-to-br from-white to-blue-50/50 p-5 shadow-md shadow-blue-600/10 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-600/15 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-500/35 dark:from-slate-900 dark:to-slate-800/95 dark:shadow-slate-950/50 dark:hover:border-blue-400/60 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950 sm:p-6"
                      : "group tile-interactive p-5 sm:p-6"
                  }
                >
                  {isSettings ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 transition-colors group-hover:bg-blue-600/25 dark:bg-blue-500/15 dark:group-hover:bg-blue-500/25">
                          <svg
                            className="h-7 w-7 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={item.icon}
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 sm:text-xl">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {item.desc}
                          </p>
                          <p className="mt-2 text-xs leading-snug text-slate-500 dark:text-slate-400">
                            Review your member details and update your name or email.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 border-t border-slate-200/90 pt-3 text-blue-600 dark:border-slate-600 dark:text-blue-400 sm:border-t-0 sm:pt-0">
                        <span className="text-sm font-bold tracking-wide">Open</span>
                        <svg
                          className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 transition-colors group-hover:bg-blue-600/25 sm:h-14 sm:w-14">
                        <svg
                          className="h-6 w-6 text-blue-600 dark:text-blue-400 sm:h-7 sm:w-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-50 sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                        {item.desc}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="marketing-panel p-6 sm:p-8">
            <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-50">Account details</h2>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">A quick snapshot of your Smart Gym profile.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200/90 bg-blue-50/40 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-600 dark:bg-slate-800/90 dark:hover:border-blue-500/40 dark:hover:bg-slate-800">
                <p className="mb-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">Account type</p>
                <p className="text-lg font-bold capitalize text-slate-900 sm:text-xl dark:text-slate-50">{user?.role}</p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-blue-50/40 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-600 dark:bg-slate-800/90 dark:hover:border-blue-500/40 dark:hover:bg-slate-800">
                <p className="mb-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">Email</p>
                <p className="truncate text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-50">{user?.email}</p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-blue-50/40 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-600 dark:bg-slate-800/90 dark:hover:border-blue-500/40 dark:hover:bg-slate-800">
                <p className="mb-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">Member since</p>
                <p className="text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-50">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;



