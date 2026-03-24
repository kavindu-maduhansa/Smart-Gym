import express from "express";
// Import your own functions (since you own the controller)
import { 
    getLeaderboard, 
    upsertProfile, 
    addSchedule, 
    getMySchedules, 
    deleteSchedule 
} from "../controllers/trainerController.js";

import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/leaderboard", getLeaderboard);

// Protected (using JWT auth middleware)
router.post("/profile", authenticateJWT, upsertProfile);
router.post('/schedules', authenticateJWT, addSchedule);
router.get('/schedules', authenticateJWT, getMySchedules);
router.delete('/schedules/:id', authenticateJWT, deleteSchedule);

export default router;