import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        },
      );

      if (!response.data || !response.data.token) {
        setError("Invalid response from server. Please try again.");
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("userId", response.data.userId);

      // Dispatch event to notify Navbar component of login
      window.dispatchEvent(new Event("tokenChanged"));

      navigate("/");
    } catch (err) {
      let errorMessage = "Login failed. Please try again.";

      if (err.response) {
        // Server responded with error
        errorMessage =
          err.response.data && err.response.data.message
            ? err.response.data.message
            : `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response
        errorMessage =
          "Cannot connect to server. Make sure the backend is running on port 5000.";
      } else {
        // Error in request setup
        errorMessage = err.message || "An unexpected error occurred.";
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-2xl shadow-blue-600/10 backdrop-blur-md">
          <div className="border-b border-blue-600/30 bg-gradient-to-r from-blue-600/20 to-blue-600/10 p-6 sm:p-8">
            <h1 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-center text-sm text-slate-600">Sign in to continue to your dashboard</p>
          </div>

          <div className="p-6 sm:p-8">
            {error ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            ) : null}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                />
              </div>
              <button type="submit" className="ui-btn-primary w-full">
                Login
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;





