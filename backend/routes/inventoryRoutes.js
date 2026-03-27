import express from "express";
import multer from "multer";
import path from "path";
import {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getRecentActivity,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Routes
router.post("/add", upload.single("image"), addItem);
router.get("/", getAllItems);
router.get("/activity/recent", getRecentActivity); // ✅ GET RECENT ACTIVITY
router.get("/:id", getItemById);
// Support both /update/:id and /:id for PUT requests
router.put("/update/:id", upload.single("image"), updateItem);
router.put("/:id", upload.single("image"), updateItem);
// Support both /delete/:id and /:id for DELETE requests
router.delete("/delete/:id", deleteItem);
router.delete("/:id", deleteItem);

export default router;