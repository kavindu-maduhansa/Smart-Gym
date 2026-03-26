import express from "express";
import multer from "multer";
import path from "path";
import {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post("/add", upload.single("image"), addItem); // 'image' is the field name
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.put("/update/:id", upload.single("image"), updateItem);
router.delete("/delete/:id", deleteItem);

export default router;