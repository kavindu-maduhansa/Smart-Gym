import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const linkClass =
  "rounded-md px-2 py-2 text-base font-medium text-slate-900 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

const Navbar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
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
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white/90 py-3 shadow-md backdrop-blur-md sm:px-4 lg:px-8"
      aria-label="Main navigation"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-2 sm:px-0">
        <Link
          to="/"
          className="text-lg font-bold text-blue-600 sm:text-xl lg:text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
          onClick={closeMenu}
        >
          Gym Management System
        </Link>

        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div
          id="primary-navigation"
          className={`${menuOpen ? "flex" : "hidden"} w-full flex-col gap-1 border-t border-slate-200 pt-4 pb-2 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:pb-0 lg:pt-0`}
        >
          <Link to="/" className={linkClass} onClick={closeMenu}>
            Home
          </Link>
          <Link to="/about" className={linkClass} onClick={closeMenu}>
            About
          </Link>
          <Link to="/contact" className={linkClass} onClick={closeMenu}>
            Contact
          </Link>

          {!role && (
            <>
              <Link
                to="/login"
                className="ui-btn-primary justify-center text-center lg:min-h-0 lg:py-2"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="ui-btn-ghost justify-center text-center lg:min-h-0 lg:py-2"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link to="/admin-dashboard" className={linkClass} onClick={closeMenu}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] lg:min-h-0"
              >
                Logout
              </button>
            </>
          )}

          {role === "student" && (
            <>
              <Link to="/student-dashboard" className={linkClass} onClick={closeMenu}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] lg:min-h-0"
              >
                Logout
              </button>
            </>
          )}

          {role === "trainer" && (
            <>
              <Link to="/trainer-dashboard" className={linkClass} onClick={closeMenu}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] lg:min-h-0"
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
