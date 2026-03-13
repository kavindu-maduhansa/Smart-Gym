import User from "../models/User.js";

export const checkMembershipStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Skip membership check for admins
    if (user.role === "admin") {
      return next();
    }

    if (user.membershipExpiry < new Date()) {
      return res
        .status(403)
        .json({ message: "Membership expired. Please renew." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
