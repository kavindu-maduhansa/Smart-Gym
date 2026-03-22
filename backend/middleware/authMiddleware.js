// backend/middleware/authMiddleware.js
// Middleware to protect routes using JWT authentication

import jwt from "jsonwebtoken";

// JWT authentication middleware
export function authenticateJWT(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  // Check if header is present and starts with 'Bearer '
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Extract the token
    const token = authHeader.split(" ")[1];
    try {
      // Verify the token using the secret from .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attach decoded user info to req.user
      req.user = decoded;
      // Call next middleware or route handler
      next();
    } catch (error) {
      // Token is invalid or expired
      return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }
  } else {
    // No token provided
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided." });
  }
}
