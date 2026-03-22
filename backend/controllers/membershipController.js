// backend/controllers/membershipController.js
// Controller for membership renewal request operations

import MembershipRequest from "../models/MembershipRequest.js";
import User from "../models/User.js";

// @desc    Create a membership renewal request
// @route   POST /api/membership/request-renewal
// @access  Private (Student)
export async function requestRenewal(req, res) {
  try {
    const { packageType } = req.body;

    // Validate packageType
    if (
      !packageType ||
      !["monthly", "quarterly", "annual"].includes(packageType)
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid package type (monthly, quarterly, or annual).",
      });
    }

    // Get user details from the authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if there's already a pending request
    const existingRequest = await MembershipRequest.findOne({
      userId: user._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending renewal request.",
      });
    }

    // Create new membership request
    const membershipRequest = new MembershipRequest({
      userId: user._id,
      userName: user.name,
      email: user.email,
      packageType,
      currentMembershipExpiry: user.membershipExpiry,
    });

    await membershipRequest.save();

    res.status(201).json({
      message: "Your renewal request has been sent to the admin.",
      request: membershipRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Get all membership renewal requests
// @route   GET /api/membership/requests
// @access  Private/Admin
export async function getAllRequests(req, res) {
  try {
    const requests = await MembershipRequest.find()
      .populate("userId", "name email membershipExpiry")
      .sort({ requestDate: -1 });

    res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Approve a membership renewal request
// @route   PUT /api/membership/approve/:requestId
// @access  Private/Admin
export async function approveRequest(req, res) {
  try {
    const { requestId } = req.params;

    // Find the request
    const request = await MembershipRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Check if already processed
    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request has already been ${request.status}.`,
      });
    }

    // Find the user
    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Calculate new expiry date based on package type
    const currentExpiry = user.membershipExpiry || new Date();
    const now = new Date();

    // If membership is expired, start from now, otherwise extend from current expiry
    const baseDate = currentExpiry > now ? currentExpiry : now;

    let daysToAdd;
    switch (request.packageType) {
      case "monthly":
        daysToAdd = 30;
        break;
      case "quarterly":
        daysToAdd = 90;
        break;
      case "annual":
        daysToAdd = 365;
        break;
      default:
        daysToAdd = 30;
    }

    const newExpiry = new Date(
      baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000,
    );
    user.membershipExpiry = newExpiry;
    user.membershipType = request.packageType;
    await user.save();

    // Update request status
    request.status = "approved";
    await request.save();

    res.status(200).json({
      message: "Membership renewal request approved successfully.",
      newExpiry: user.membershipExpiry,
      request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @desc    Reject a membership renewal request
// @route   PUT /api/membership/reject/:requestId
// @access  Private/Admin
export async function rejectRequest(req, res) {
  try {
    const { requestId } = req.params;

    // Find the request
    const request = await MembershipRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Check if already processed
    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request has already been ${request.status}.`,
      });
    }

    // Update request status
    request.status = "rejected";
    await request.save();

    res.status(200).json({
      message: "Membership renewal request rejected.",
      request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
}
