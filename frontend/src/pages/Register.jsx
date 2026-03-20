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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-orange">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange text-white font-bold py-2 rounded-lg shadow hover:bg-orange-dark transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {success && (
          <p className="text-green-600 text-center mt-4">{success}</p>
        )}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-orange hover:underline font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
