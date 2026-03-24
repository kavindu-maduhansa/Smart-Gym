import express from "express";
import { submitFeedback, getTrainerFeedback, getMyFeedbacks } from "../controllers/feedbackController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student submits feedback after session
router.post("/", authenticateJWT, submitFeedback);

// Get all feedback for a trainer
router.get("/trainer/:trainerId", getTrainerFeedback);

// Get personal feedbacks for a logged-in trainer
router.get("/my-feedbacks", authenticateJWT, getMyFeedbacks);

export default router;
