import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EditAccount = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = response.data;
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
        });
        setUserId(userData._id);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to update profile.",
      );
    } finally {
      setUpdating(false);
    }
  };

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
        ></div>
        <div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-blue-600 opacity-20 mix-blend-screen blur-3xl filter"></div>
        <div
          className="absolute right-10 bottom-20 h-72 w-72 animate-pulse rounded-full bg-blue-600 opacity-10 mix-blend-screen blur-3xl filter"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-2xl backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/90">
            <div className="border-b border-blue-600/30 bg-gradient-to-r from-blue-600/20 to-blue-600/10 p-6 backdrop-blur-md sm:p-8 dark:border-blue-500/30 dark:from-blue-600/15 dark:to-slate-800/80">
              <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-50">
                Edit your account
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Update the name and email tied to your member login.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              {loading ? (
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-slate-700 dark:text-slate-300">Loading...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {success && (
                    <div className="flex items-center rounded-lg border border-green-500/50 bg-green-600/20 p-4 text-sm text-green-800 dark:border-green-500/40 dark:bg-green-900/30 dark:text-green-200 sm:text-base">
                      <svg className="mr-2 h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {success}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center rounded-lg border border-red-500/50 bg-red-600/20 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200 sm:text-base">
                      <svg className="mr-2 h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Full name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 transition-all duration-200 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 transition-all duration-200 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className={`flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 sm:py-3 sm:text-base ${
                        updating ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      {updating ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Save changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      disabled={updating}
                      className="flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-6 py-2 text-sm font-bold text-slate-900 transition-all duration-300 hover:border-blue-600/50 hover:bg-white/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:py-3 sm:text-base"
                    >
                      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>

                  <div className="rounded-lg border border-blue-500/50 bg-blue-600/20 p-3 text-xs text-blue-800 sm:p-4 sm:text-sm dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-200">
                    <p>
                      <strong>Note:</strong> Changes apply to your login and appear on your profile right away.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;
