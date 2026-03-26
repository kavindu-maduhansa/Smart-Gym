import express from "express";
import { submitFeedback, getTrainerFeedback, getMyFeedbacks, getStudentFeedbacks, updateFeedback, deleteFeedback } from "../controllers/feedbackController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student submits feedback after session
router.post("/", authenticateJWT, submitFeedback);

// Get all feedback for a trainer
router.get("/trainer/:trainerId", getTrainerFeedback);

// Get personal feedbacks for a logged-in trainer
router.get("/my-feedbacks", authenticateJWT, getMyFeedbacks);

// Get all feedbacks submitted by the logged-in student
router.get("/my-submissions", authenticateJWT, getStudentFeedbacks);

// Update feedback
router.put("/:id", authenticateJWT, updateFeedback);

// Delete feedback
router.delete("/:id", authenticateJWT, deleteFeedback);

export default router;
