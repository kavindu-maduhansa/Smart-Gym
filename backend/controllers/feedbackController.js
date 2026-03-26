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
    await Trainer.findOneAndUpdate(
      { userId: trainerId }, 
      { 'metrics.avgRating': avgRating },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
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

// Get personal feedbacks for the logged-in trainer
export const getMyFeedbacks = async (req, res) => {
  try {
    // trainerId in Feedback stores the User._id, not Trainer._id
    const feedbacks = await Feedback.find({ trainerId: req.user.id })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedbacks", error });
  }
};

// Get all feedbacks submitted by the logged-in student
export const getStudentFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ studentId: req.user.id })
      .populate('trainerId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your feedbacks", error });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const studentId = req.user.id;

    const feedback = await Feedback.findOneAndUpdate(
      { _id: id, studentId },
      { rating, comment },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found or unauthorized." });
    }

    // Recalculate trainer's avgRating
    const feedbacks = await Feedback.find({ trainerId: feedback.trainerId });
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    await Trainer.findOneAndUpdate(
      { userId: feedback.trainerId },
      { 'metrics.avgRating': avgRating }
    );

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error updating feedback", error });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const feedback = await Feedback.findOneAndDelete({ _id: id, studentId });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found or unauthorized." });
    }

    // Recalculate trainer's avgRating
    const feedbacks = await Feedback.find({ trainerId: feedback.trainerId });
    const avgRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
      : 0;
    
    await Trainer.findOneAndUpdate(
      { userId: feedback.trainerId },
      { 'metrics.avgRating': avgRating }
    );

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting feedback", error });
  }
};
