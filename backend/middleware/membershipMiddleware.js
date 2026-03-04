import User from "../models/User.js";

export const checkMembershipStatus = async (req, res, next) => {
  try {
    console.log("req.user:", req.user); // Debug log
    console.log("Looking for user ID:", req.user.id); // Debug log
    const user = await User.findById(req.user.id);
    console.log("Found user:", user); // Debug log
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User role:", user.role);
    console.log("Membership expiry:", user.membershipExpiry);

    // Skip membership check for admins
    if (user.role === "admin") {
      console.log("Admin user - skipping membership check");
      return next();
    }

    if (user.membershipExpiry < new Date()) {
      return res
        .status(403)
        .json({ message: "Membership expired. Please renew." });
    }
    next();
  } catch (error) {
    console.log("Error:", error); // Debug log
    res.status(500).json({ message: "Server error" });
  }
};
