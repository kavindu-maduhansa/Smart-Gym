// inventoryController.js
import Inventory from "../models/Inventory.js";
import path from "path";
import fs from "fs";

// CREATE ITEM
export const addItem = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : "";
    const item = new Inventory({ ...req.body, image });
    const savedItem = await item.save();
    res.status(201).json({ success: true, message: "Item added successfully", data: savedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add item", error: error.message });
  }
};

// GET SINGLE ITEM BY ID
export const getItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching item", error: error.message });
  }
};

// GET ALL ITEMS
export const getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch items", error: error.message });
  }
};

// UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Remove old image if new one is uploaded
    if (req.file && item.image) {
      const oldPath = path.join("uploads", item.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const updatedData = { ...req.body, image: req.file ? req.file.filename : item.image };
    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Item updated successfully", data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update item", error: error.message });
  }
};

// DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ success: false, message: "Item not found" });

    if (deletedItem.image) {
      const imgPath = path.join("uploads", deletedItem.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete item", error: error.message });
  }
};