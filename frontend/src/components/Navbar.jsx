import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const Navbar = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = parseJwt(token);
        setRole(payload?.role || null);
      } else {
        setRole(null);
      }
    };
    checkRole();
    window.addEventListener("storage", checkRole);
    return () => window.removeEventListener("storage", checkRole);
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole(null);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-70 backdrop-blur-md shadow-lg py-4 px-8">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-orange cursor-pointer"
          onClick={() => navigate("/")}
        >
          Gym Management System
        </div>
        {/* Menu */}
        <div className="flex space-x-8 text-lg font-medium items-center">
          {/* No Home button */}
          {!role && (
            <>
              <Link
                to="/login"
                className="text-white hover:text-orange transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white hover:text-orange transition-colors duration-200"
              >
                Register
              </Link>
            </>
          )}
          {role === "admin" &&
            window.location.pathname !== "/admin-dashboard" && (
              <>
                <button
                  onClick={() => navigate("/admin-dashboard")}
                  className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-dark transition-colors duration-200 font-semibold"
                >
                  Oversight
                </button>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-orange transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            )}
          {role === "admin" &&
            window.location.pathname === "/admin-dashboard" && (
              <>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-orange transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            )}
          {role === "student" && (
            <>
              <button
                onClick={() => navigate("/student-dashboard")}
                className="bg-orange text-white px-4 py-2 rounded hover:bg-orange-dark transition-colors duration-200 font-semibold"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-orange transition-colors duration-200"
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
