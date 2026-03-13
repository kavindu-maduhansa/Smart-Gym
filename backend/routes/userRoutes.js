// backend/routes/userRoutes.js
// Routes for user-related endpoints

import express from "express";
import { registerUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/userController.js";
import { getUserProfile } from "../controllers/userController.js";
import { toggleBlockUser } from "../controllers/userController.js";
import { updateUser } from "../controllers/userController.js";
import { deleteUser } from "../controllers/userController.js";
import { getAllUsers } from "../controllers/userController.js";
import { renewMembership } from "../controllers/userController.js";
import { changePassword } from "../controllers/userController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { checkMembershipStatus } from "../middleware/membershipMiddleware.js";

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get("/", authenticateJWT, isAdmin, getAllUsers);

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private (requires JWT)
router.get("/profile", authenticateJWT, checkMembershipStatus, getUserProfile);

// @route   GET /api/users/admin-test
// @desc    Admin-only test endpoint
// @access  Private/Admin
router.get("/admin-test", authenticateJWT, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// @route   PUT /api/users/block/:id
// @desc    Block/Unblock a user
// @access  Private/Admin
router.put("/block/:id", authenticateJWT, isAdmin, toggleBlockUser);

// @route   PUT /api/users/renew/:id
// @desc    Renew user's membership
// @access  Private/Admin
router.put("/renew/:id", authenticateJWT, isAdmin, renewMembership);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", authenticateJWT, changePassword);

// @route   PUT /api/users/:id
// @desc    Update user details
// @access  Private (own profile or admin)
router.put("/:id", authenticateJWT, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete("/:id", authenticateJWT, isAdmin, deleteUser);

export default router;
