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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/dumbbells-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 -z-10"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-orange-300 bg-opacity-60 backdrop-blur-lg rounded-xl shadow-2xl border-2 border-orange-400 text-white">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Login
        </h2>
        {error && (
          <div className="p-2 mb-4 text-sm text-red-400 bg-red-100 bg-opacity-20 rounded">
            {error}
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium text-white">Email</label>
            <input
              type="email"
              className="w-full border border-orange-300 rounded-lg px-4 py-2 bg-white bg-opacity-40 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-white">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-orange-300 rounded-lg px-4 py-2 bg-white bg-opacity-40 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-900 text-white font-bold py-2 rounded-lg shadow hover:bg-orange-500 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-white">Don't have an account? </span>
          <Link
            to="/register"
            className="text-orange-400 hover:underline font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
