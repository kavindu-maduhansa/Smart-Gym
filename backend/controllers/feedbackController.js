import Feedback from "../models/Feedback.js";
import Trainer from "../models/Trainer.js";

// Submit feedback for a session
export const submitFeedback = async (req, res) => {
  try {
    const { sessionId, trainerId, rating, comment } = req.body;
    const studentId = req.user.id;
    // Prevent duplicate feedback for same session by same student
    const exists = await Feedback.findOne({ sessionId, studentId });
    if (exists) {
      return res.status(400).json({ message: "Feedback already submitted for this session." });
    }
    const feedback = await Feedback.create({ sessionId, trainerId, studentId, rating, comment });
    // Optionally update trainer's avgRating
    const feedbacks = await Feedback.find({ trainerId });
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    await Trainer.findByIdAndUpdate(trainerId, { 'metrics.avgRating': avgRating });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
};

// Get feedback for a trainer
export const getTrainerFeedback = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const feedbacks = await Feedback.find({ trainerId }).populate('studentId', 'name');
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
};
