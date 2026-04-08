import InventoryBooking from "../models/InventoryBooking.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";

// CREATE BOOKING REQUEST
export const createBooking = async (req, res) => {
  try {
    const { inventoryId, quantity, purpose, requestedStartDate, requestedEndDate } = req.body;
    const userId = req.body.userId;

    // Validate dates
    const startDate = new Date(requestedStartDate);
    const endDate = new Date(requestedEndDate);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Check inventory item exists
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Check quantity availability
    if (inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${inventory.quantity} units available`,
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create booking
    const booking = new InventoryBooking({
      inventoryId,
      userId,
      userName: user.name || user.username,
      userEmail: user.email,
      itemName: inventory.itemName,
      quantity,
      purpose,
      requestedStartDate: startDate,
      requestedEndDate: endDate,
      status: "pending",
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      data: savedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// GET ALL BOOKINGS (Admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await InventoryBooking.find()
      .populate("inventoryId", "itemName category condition supplier")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// GET BOOKINGS BY STATUS (Admin)
export const getBookingsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["pending", "approved", "declined", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const bookings = await InventoryBooking.find({ status })
      .populate("inventoryId", "itemName category condition")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// GET USER'S BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await InventoryBooking.find({ userId })
      .populate("inventoryId", "itemName category condition supplier")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
};

// APPROVE BOOKING (Admin)
export const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.body.adminId || "admin";

    console.log("Approve booking request - ID:", bookingId, "Admin:", adminId);

    const booking = await InventoryBooking.findById(bookingId);
    if (!booking) {
      console.error("Booking not found:", bookingId);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      console.error("Booking status is not pending:", booking.status);
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be approved",
      });
    }

    // Update booking status
    booking.status = "approved";
    booking.adminNotes = adminNotes || "";
    booking.approvedDate = new Date();
    booking.approvedBy = adminId;

    const updatedBooking = await booking.save();
    console.log("Booking approved successfully:", updatedBooking._id);

    res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve booking",
      error: error.message,
    });
  }
};

// DECLINE BOOKING (Admin)
export const declineBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { declinedReason } = req.body;

    console.log("Decline booking request - ID:", bookingId, "Reason:", declinedReason);

    if (!declinedReason) {
      console.error("Decline reason not provided");
      return res.status(400).json({
        success: false,
        message: "Decline reason is required",
      });
    }

    const booking = await InventoryBooking.findById(bookingId);
    if (!booking) {
      console.error("Booking not found:", bookingId);
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      console.error("Booking status is not pending:", booking.status);
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be declined",
      });
    }

    // Update booking status
    booking.status = "declined";
    booking.declinedReason = declinedReason;

    const updatedBooking = await booking.save();
    console.log("Booking declined successfully:", updatedBooking._id);

    res.status(200).json({
      success: true,
      message: "Booking declined",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error declining booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decline booking",
      error: error.message,
    });
  }
};

// CANCEL BOOKING (User)
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await InventoryBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this booking",
      });
    }

    booking.status = "cancelled";
    const updatedBooking = await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

// GET BOOKING BY ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await InventoryBooking.findById(bookingId)
      .populate("inventoryId")
      .populate("userId", "name email")
      .populate("approvedBy", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};
