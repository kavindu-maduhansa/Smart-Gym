import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name,
          email,
          password,
        },
      );
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        window.dispatchEvent(new Event("tokenChanged"));
      }
      setSuccess("Registration successful! Redirecting to home page...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg-base overflow-hidden flex items-center justify-center">
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-24">
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-2xl shadow-blue-600/10 backdrop-blur-md">
          <div className="border-b border-blue-600/30 bg-gradient-to-r from-blue-600/20 to-blue-600/10 p-6 sm:p-8">
            <h1 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">Create an account</h1>
            <p className="mt-2 text-center text-sm text-slate-600">Join Smart Gym and manage your fitness journey</p>
          </div>

          <div className="p-6 sm:p-8">
            {success ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900" role="status">
                {success}
              </div>
            ) : null}
            {error ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reg-name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  placeholder="Choose a secure password"
                />
              </div>
              <button
                type="submit"
                className="ui-btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Registering…" : "Register"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
