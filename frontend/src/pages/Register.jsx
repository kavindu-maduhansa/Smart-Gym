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
      // Auto-login the user after registration
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        // Dispatch a custom event to notify Navbar
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl shadow-blue-600/20 p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">
          Register
        </h2>
        {success && (
          <p className="text-green-400 text-center mt-4">{success}</p>
        )}
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-slate-900">Name</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-100 text-slate-900 placeholder-slate-500/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-slate-900">Email</label>
            <input
              type="email"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-100 text-slate-900 placeholder-slate-500/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-slate-900">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-100 text-slate-900 placeholder-slate-500/50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700/90 text-slate-900 font-bold py-2 rounded-lg shadow-lg shadow-blue-600/20 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-slate-900">Already have an account? </span>
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Login
          </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;



