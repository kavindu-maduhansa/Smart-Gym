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
      await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/dumbbells-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 -z-10"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-orange-500 bg-opacity-60 backdrop-blur-lg rounded-xl shadow-2xl border-2 border-orange-400 text-white">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Register
        </h2>
        {success && (
          <p className="text-green-400 text-center mt-4">{success}</p>
        )}
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-white">Name</label>
            <input
              type="text"
              className="w-full border border-orange-300 rounded-lg px-4 py-2 bg-white bg-opacity-40 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-white">Email</label>
            <input
              type="email"
              className="w-full border border-orange-300 rounded-lg px-4 py-2 bg-white bg-opacity-40 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
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
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-900 text-white font-bold py-2 rounded-lg shadow hover:bg-orange-600 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-white">Already have an account? </span>
          <Link
            to="/login"
            className="text-orange-400 hover:underline font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
