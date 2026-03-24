import express from "express";
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessage,
  replyContactMessage,
  deleteContactMessage,
} from "../controllers/contactController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", createContactMessage);
router.get("/", authenticateJWT, isAdmin, getAllContactMessages);
router.get("/:id", authenticateJWT, isAdmin, getContactMessageById);
router.put("/:id", authenticateJWT, isAdmin, updateContactMessage);
router.put("/:id/reply", authenticateJWT, isAdmin, replyContactMessage);
router.delete("/:id", authenticateJWT, isAdmin, deleteContactMessage);

export default router;
