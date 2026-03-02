// Role-based authorization middleware for admin access
// This middleware checks if the authenticated user has the 'admin' role

export function isAdmin(req, res, next) {
  // Ensure req.user exists (should be set by authentication middleware)
  if (!req.user || !req.user.role) {
    // User is not authenticated or role is missing
    return res.status(403).json({ message: "Forbidden: No user role found." });
  }

  // Check if the user's role is 'admin'
  if (req.user.role !== "admin") {
    // User is not an admin, deny access
    return res.status(403).json({ message: "Forbidden: Admins only." });
  }

  // User is an admin, allow access to the next middleware/route
  next();
}

// ES module export above
