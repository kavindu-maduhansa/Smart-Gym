import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Function to check and set role from token
    const checkRole = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setRole(payload.role || null);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };
    checkRole();
    // Listen for storage changes (other tabs) and custom tokenChanged event (same tab)
    window.addEventListener("storage", checkRole);
    window.addEventListener("tokenChanged", checkRole);
    return () => {
      window.removeEventListener("storage", checkRole);
      window.removeEventListener("tokenChanged", checkRole);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-lg py-4 px-8 border-b border-slate-200">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Gym Management System
        </div>
        {/* Menu */}
        <div className="flex space-x-8 text-lg font-medium items-center">
          {/* Main navigation links */}
          <Link
            to="/"
            className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
          >
            About
          </Link>

          <Link
            to="/contact"
            className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
          >
            Contact
          </Link>
          {/* Auth/User links */}
          {!role && (
            <>
              <Link
                to="/login"
                className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg border-2 border-blue-600 hover:bg-blue-700 hover:text-white transition-all duration-200"
                style={{ boxShadow: "0 4px 16px 0 rgba(59,130,246,0.15)" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg border-2 border-blue-600 hover:bg-blue-700 hover:text-white transition-all duration-200"
                style={{ boxShadow: "0 4px 16px 0 rgba(59,130,246,0.15)" }}
              >
                Register
              </Link>
            </>
          )}
          {role === "admin" && (
            <>
              <Link
                to="/admin-dashboard"
                className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-slate-900 px-4 py-2 rounded hover:bg-blue-700-dark transition-colors duration-200 font-semibold"
              >
                Logout
              </button>
            </>
          )}
          {role === "student" && (
            <>
              <Link
                to="/student-dashboard"
                className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-slate-900 px-4 py-2 rounded hover:bg-blue-700-dark transition-colors duration-200 font-semibold"
              >
                Logout
              </button>
            </>
          )}
          {role === "trainer" && (
            <>
              <Link
                to="/trainer-dashboard"
                className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-slate-900 px-4 py-2 rounded hover:bg-blue-700-dark transition-colors duration-200 font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

