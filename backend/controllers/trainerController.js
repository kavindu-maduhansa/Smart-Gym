import Trainer from "../models/Trainer.js";
import TrainerSchedule from "../models/TrainerSchedule.js";

// 1. Get all trainers for the leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const trainers = await Trainer.find()
            .populate('userId', 'name email') 
            .sort({ 'metrics.avgRating': -1 });
        res.status(200).json(trainers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error });
    }
};

// 2. Create or update trainer details
export const upsertProfile = async (req, res) => {
    try {
        const { userId, ...updateData } = req.body;
        const trainer = await Trainer.findOneAndUpdate(
            { userId }, 
            updateData,
            { new: true, upsert: true }
        );
        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ message: "Error saving profile", error });
    }
};

// 3. Add a new schedule slot
export const addSchedule = async (req, res) => {
    try {
        const { title, date, time } = req.body;
        const schedule = await TrainerSchedule.create({
            title,
            date,
            time,
            trainer: req.user.id 
        });
        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({ message: "Failed to create schedule", error: error.message });
    }
};

// 4. Get trainer's own schedules
export const getMySchedules = async (req, res) => {
    try {
        const schedules = await TrainerSchedule.find({ trainer: req.user.id })
            .populate('bookedBy', 'name'); 
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Error fetching schedules", error });
    }
};

// 5. Delete a schedule
export const deleteSchedule = async (req, res) => {
    try {
        const schedule = await TrainerSchedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: "Not found" });
        
        if (schedule.trainer.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await schedule.deleteOne();
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting", error });
    }
};

// 6. Update Attendance for a booked schedule
export const updateAttendance = async (req, res) => {
    try {
        const { attendanceStatus } = req.body;
        const schedule = await TrainerSchedule.findById(req.params.id);
        
        if (!schedule) return res.status(404).json({ message: "Schedule not found" });
        
        if (schedule.trainer.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        if (!schedule.bookedBy) {
            return res.status(400).json({ message: "Cannot mark attendance for an unbooked session" });
        }

        schedule.attendanceStatus = attendanceStatus;
        await schedule.save();

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Error updating attendance", error });
    }
};