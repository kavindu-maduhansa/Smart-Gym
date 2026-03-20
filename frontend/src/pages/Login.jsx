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
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Login failed. Please try again.",
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && (
          <div className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
