import TrainerSchedule from "../models/TrainerSchedule.js";

// @desc    Get all available schedules from all trainers
export const getAvailableSchedules = async (req, res) => {
    try {
        // We only want schedules where bookedBy is still null
        const schedules = await TrainerSchedule.find({ bookedBy: null })
            .populate({
                path: 'trainer',
                select: 'name email', // Get trainer details from the User model
            });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Error fetching available sessions", error: error.message });
    }
};

// @desc    Get all sessions booked by the current student
export const getMyBookedSessions = async (req, res) => {
    try {
        const mySessions = await TrainerSchedule.find({ bookedBy: req.user.id })
            .populate({
                path: 'trainer',
                select: 'name email', 
            });
        res.status(200).json(mySessions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your bookings", error: error.message });
    }
};

// @desc    Book a specific session
export const bookSession = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await TrainerSchedule.findById(id);

        if (!schedule) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (schedule.bookedBy) {
            return res.status(400).json({ message: "This session is already booked by someone else" });
        }

        // Assign the logged-in student's ID (from the JWT) to the schedule
        schedule.bookedBy = req.user.id; 
        await schedule.save();

        res.status(200).json({ message: "Session booked successfully!", schedule });
    } catch (error) {
        res.status(500).json({ message: "Booking failed", error: error.message });
    }
};