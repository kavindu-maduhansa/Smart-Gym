// backend/controllers/userController.js
// Controller for user-related operations

import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/validation.js";

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password." });
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.message });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with default role 'student'
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "student", // Default role
    });

    // Save user to database
    await user.save();

    // Generate JWT token (same as login)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Return success message, user info, and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      message: "User registered successfully!",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check that JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Server configuration error." });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    // Return token, role, and userId
    res.status(200).json({
      token,
      role: user.role,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private (requires JWT)
export async function getUserProfile(req, res) {
  try {
    // req.user is set by the JWT middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Toggle block/unblock user
// @route   PUT /api/users/block/:id
// @access  Private/Admin
export async function toggleBlockUser(req, res) {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Toggle the isBlocked status
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (own profile) or Admin (any user)
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if user is updating their own profile or is an admin
    const isAdmin = req.user.role === "admin";
    const isOwnProfile = req.user.id === id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        message: "Forbidden: You can only update your own profile.",
      });
    }

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate and update name if provided
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return res.status(400).json({ message: nameValidation.message });
      }
      user.name = name;
    }

    // Validate and update email if provided
    if (email && email !== user.email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ message: emailValidation.message });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already in use by another user.",
        });
      }
      user.email = email;
    }

    // Admin-only: Allow role update
    if (role && isAdmin) {
      const validRoles = ["admin", "student", "trainer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role. Must be 'admin', 'student', or 'trainer'.",
        });
      }
      user.role = role;
    }

    // Save updated user
    await user.save();

    res.status(200).json({
      message: "User updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export async function getAllUsers(req, res) {
  try {
    // Find all users and exclude passwords
    const users = await User.find().select("-password");

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Find and delete user by ID
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Renew user's membership
// @route   PUT /api/users/renew/:id
// @access  Private/Admin
export async function renewMembership(req, res) {
  try {
    const { id } = req.params;
    const { membershipType } = req.body;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if membership has expired (admin should only renew expired memberships)
    const now = new Date();
    if (!user.membershipExpiry || user.membershipExpiry > now) {
      return res.status(400).json({
        message:
          "This user's membership is still active. Can only renew expired memberships.",
      });
    }

    // Calculate days based on membership type
    let daysToAdd = 30; // default to monthly
    switch (membershipType) {
      case "Monthly":
        daysToAdd = 30;
        break;
      case "Quarterly":
        daysToAdd = 90;
        break;
      case "Annual":
        daysToAdd = 365;
        break;
      default:
        daysToAdd = 30;
    }

    // Extend membershipExpiry from current expiry (or from today if expired)
    const currentExpiry = user.membershipExpiry || new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(
      baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000,
    );
    user.membershipExpiry = newExpiry;
    user.membershipType = membershipType;

    // Save updated user
    await user.save();

    res.status(200).json({
      message: "Membership renewed successfully.",
      membershipExpiry: user.membershipExpiry,
      membershipType: user.membershipType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if both passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please provide current password and new password.",
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Find user by ID from JWT token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password.",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;

    // Save updated user
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Create a new user (Admin only)
// @route   POST /api/users/admin/create
// @access  Private/Admin
export async function createUserByAdmin(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, password, and role." });
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ message: nameValidation.message });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Validate role
    const validRoles = ["admin", "student", "trainer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'admin', 'student', or 'trainer'.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with specified role
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save user to database
    await user.save();

    // Return success message and user info
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      message: "User created successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}
