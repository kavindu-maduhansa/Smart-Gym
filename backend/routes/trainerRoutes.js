import express from "express";
import { getLeaderboard, upsertProfile } from "../controllers/trainerController.js";

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.post("/profile", upsertProfile);

export default router;