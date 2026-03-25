import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import {
  adminEngagement,
  adminLogs,
  adminMostAsked,
  bookSlot,
  cancelSlot,
  chat,
  getSlots,
  getMyChatSessionTurns,
  listMyChatSessions,
} from "../controllers/chatController.js";

const router = express.Router();

// Gym chatbot + booking integration endpoints (paths per requirement)
router.post("/chat", authenticateJWT, chat);
router.get("/get-slots", authenticateJWT, getSlots);
router.post("/book-slot", authenticateJWT, bookSlot);
router.post("/cancel-slot", authenticateJWT, cancelSlot);

// Admin analytics endpoints (optional UI)
router.get("/chat/admin/logs", authenticateJWT, isAdmin, adminLogs);
router.get("/chat/admin/most-asked", authenticateJWT, isAdmin, adminMostAsked);
router.get("/chat/admin/stats", authenticateJWT, isAdmin, adminEngagement);

// User history endpoints
router.get("/chat/history/sessions", authenticateJWT, listMyChatSessions);
router.get("/chat/history/sessions/:sessionId", authenticateJWT, getMyChatSessionTurns);

export default router;

