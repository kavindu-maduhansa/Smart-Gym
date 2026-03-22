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
    <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,127,17,0.1) 1px, transparent 1px), linear-gradient(rgba(255,127,17,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="backdrop-blur-md bg-gradient-to-r from-orange/20 to-orange/10 border-b border-orange/30 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Login
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="p-3 sm:p-4 mb-4 text-xs sm:text-sm text-red-200 bg-red-600/20 border border-red-500/50 rounded-lg">
                {error}
              </div>
            )}
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 font-semibold text-gray-300 text-sm">Email</label>
                <input
                  type="email"
                  className="w-full border border-white/20 rounded-lg px-4 py-2 sm:py-3 bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-300 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border border-white/20 rounded-lg px-4 py-2 sm:py-3 bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange hover:bg-orange/90 text-white font-bold py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Login
              </button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-gray-300 text-sm">Don't have an account? </span>
              <Link
                to="/register"
                className="text-orange hover:text-orange/90 font-bold text-sm"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
