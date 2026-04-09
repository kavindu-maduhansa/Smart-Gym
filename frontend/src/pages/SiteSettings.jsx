import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Student-facing settings: account overview and links to edit credentials.
 */
const SiteSettings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
      } catch (err) {
        setProfileError(
          err.response?.data?.message || "Could not load your account details.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="page-bg-base overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 ambient-gradient"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="pointer-events-none absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-blue-600 opacity-20 mix-blend-screen blur-3xl filter" />
        <div className="pointer-events-none absolute right-10 bottom-20 h-72 w-72 rounded-full bg-blue-600 opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900">
            <div className="border-b border-indigo-200/80 bg-indigo-50 p-6 sm:p-8 dark:border-slate-600 dark:bg-slate-800/90">
              <h1 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-50">
                My settings
              </h1>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Your member account and sign-in details.
              </p>
            </div>

            <div className="space-y-6 bg-slate-50 p-6 sm:p-8 dark:bg-slate-900/80">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800/60">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Account</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Name and email are stored with your gym membership. Password changes (if enabled) stay on the server.
                </p>

                {loadingProfile ? (
                  <div className="mt-4 flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Loading your profile…
                  </div>
                ) : profileError ? (
                  <p className="mt-4 text-sm text-red-700 dark:text-red-300">{profileError}</p>
                ) : profile ? (
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-slate-500 dark:text-slate-400">Full name</dt>
                      <dd className="mt-0.5 text-slate-900 dark:text-slate-100">{profile.name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500 dark:text-slate-400">Email</dt>
                      <dd className="mt-0.5 break-all text-slate-900 dark:text-slate-100">{profile.email || "—"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-semibold text-slate-500 dark:text-slate-400">Role</dt>
                      <dd className="mt-0.5 capitalize text-slate-900 dark:text-slate-100">{profile.role || "—"}</dd>
                    </div>
                  </dl>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/edit-account"
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Edit name &amp; email
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    View full profile
                  </Link>
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/student-dashboard")}
                  className="flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:text-base"
                >
                  Back to dashboard
                </button>
              </div>

              <div className="rounded-lg border border-blue-400/60 bg-blue-50 p-3 text-xs text-blue-900 sm:text-sm dark:border-blue-500/35 dark:bg-blue-950/50 dark:text-blue-100">
                <p>
                  <strong>Note:</strong> Gym-wide branding and schedules are managed by the gym. If something looks wrong on your account, contact support from the{" "}
                  <Link to="/contact" className="font-bold underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-200">
                    Contact
                  </Link>{" "}
                  page. Use the sun/moon control in the navigation bar to switch light or dark theme.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;
