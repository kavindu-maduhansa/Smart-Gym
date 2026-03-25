import Trainer from "../models/Trainer.js";
import TrainerSchedule from "../models/TrainerSchedule.js";
import ChatSession from "../models/ChatSession.js";
import User from "../models/User.js";
import TrainerNote from "../models/TrainerNote.js";

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

// 7. Get assigned students for a trainer
export const getAssignedStudents = async (req, res) => {
    try {
        const trainerId = req.user.id;

        // Find all unique students who have booked this trainer
        const bookings = await TrainerSchedule.find({ trainer: trainerId, bookedBy: { $ne: null } })
            .populate('bookedBy', 'name email membershipType')
            .lean();

        const studentMap = new Map();

        for (const booking of bookings) {
            const student = booking.bookedBy;
            if (!student) continue;

            const studentIdStr = student._id.toString();

            if (!studentMap.has(studentIdStr)) {
                // Fetch the latest goal from ChatSession
                const chatSession = await ChatSession.findOne({ userId: student._id }).sort({ updatedAt: -1 }).lean();
                
                // Fetch the last workout (most recent attended session)
                const lastWorkout = await TrainerSchedule.findOne({ 
                    bookedBy: student._id, 
                    attendanceStatus: 'Attended' 
                }).sort({ date: -1, time: -1 }).lean();

                // Calculate progress (mock/placeholder: count of attended sessions / 12)
                const attendedSessionsCount = await TrainerSchedule.countDocuments({ 
                    bookedBy: student._id, 
                    attendanceStatus: 'Attended' 
                });
                const progressValue = Math.min(Math.round((attendedSessionsCount / 12) * 100), 100);

                // Fetch the trainer's private note and progress for this student
                const trainerNote = await TrainerNote.findOne({ trainer: trainerId, student: student._id }).lean();

                studentMap.set(studentIdStr, {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    membershipType: student.membershipType || 'Basic',
                    goal: chatSession?.goal || 'General Fitness',
                    lastWorkout: lastWorkout ? `${lastWorkout.date} @ ${lastWorkout.time}` : 'None yet',
                    progress: trainerNote?.progress || 0, // Manual progress from DB
                    status: 'Active',
                    note: trainerNote?.note || ''
                });
            }
        }

        res.status(200).json(Array.from(studentMap.values()));
    } catch (error) {
        console.error("Error fetching assigned students:", error);
        res.status(500).json({ message: "Error fetching assigned students", error: error.message });
    }
};

// 8. Update private note and progress for a student
export const updateStudentNote = async (req, res) => {
    try {
        const { studentId, note, progress } = req.body;
        const trainerId = req.user.id;

        if (!studentId) return res.status(400).json({ message: "Student ID is required." });

        const updateFields = {};
        if (note !== undefined) updateFields.note = note;
        if (progress !== undefined) updateFields.progress = progress;

        const updatedNote = await TrainerNote.findOneAndUpdate(
            { trainer: trainerId, student: studentId },
            updateFields,
            { new: true, upsert: true }
        );

        res.status(200).json({ 
            message: "Roster data updated successfully", 
            note: updatedNote.note,
            progress: updatedNote.progress 
        });
    } catch (error) {
        console.error("Error updating student data:", error);
        res.status(500).json({ message: "Error updating student data", error: error.message });
    }
};