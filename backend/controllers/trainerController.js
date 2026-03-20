import Trainer from "../models/Trainer.js";

// Get all trainers for the leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const trainers = await Trainer.find()
            .populate('userId', 'name email') // Note: image_808a3e shows your user field is "name", not "full_name"
            .sort({ 'metrics.avgRating': -1 });
        res.status(200).json(trainers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error });
    }
};

// Create or update trainer details
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