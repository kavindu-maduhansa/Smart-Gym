// backend/controllers/dashboardController.js
// Controller for dashboard statistics

import User from "../models/User.js";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
export async function getDashboardStats(req, res) {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get active members count (users with membership not yet expired)
    const activeMembers = await User.countDocuments({
      membershipExpiry: { $gt: new Date() },
    });

    // Placeholder for scheduled classes (0 for now, update when model is created)
    const scheduledClasses = 0;

    // Placeholder for equipment items (0 for now, update when model is created)
    const equipmentItems = 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeMembers,
        scheduledClasses,
        equipmentItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch dashboard stats.",
    });
  }
}
