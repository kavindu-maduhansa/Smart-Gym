import Inventory from "../models/Inventory.js";
import path from "path";
import fs from "fs";

// ADD ITEM
export const addItem = async (req, res) => {
  try {
    console.log("File received:", req.file); // debug

    const image = req.file ? req.file.filename : "";

    const item = new Inventory({
      itemName: req.body.itemName,
      category: req.body.category,
      quantity: req.body.quantity,
      condition: req.body.condition,
      supplier: req.body.supplier,
      specialDetails: req.body.specialDetails,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
      image,
    });

    const savedItem = await item.save();
    res.status(201).json({ success: true, message: "Item added successfully", data: savedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add item", error: error.message });
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

// GET ITEM BY ID
export const getItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching item", error: error.message });
  }
};

// UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Delete old image if new one is uploaded
    if (req.file && item.image) {
      const oldPath = path.join("uploads", item.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Use explicit ternary for quantity to handle 0 properly
    const updatedData = {
      itemName: req.body.itemName !== undefined && req.body.itemName !== "" ? req.body.itemName : item.itemName,
      category: req.body.category || item.category,
      quantity: req.body.quantity !== undefined && req.body.quantity !== "" ? Number(req.body.quantity) : item.quantity,
      condition: req.body.condition || item.condition,
      supplier: req.body.supplier !== undefined && req.body.supplier !== "" ? req.body.supplier : item.supplier,
      specialDetails: req.body.specialDetails !== undefined && req.body.specialDetails !== "" ? req.body.specialDetails : item.specialDetails,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : item.purchaseDate,
      image: req.file ? req.file.filename : item.image,
    };

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

    // Delete associated image file if exists
    if (deletedItem.image) {
      const imgPath = path.join("uploads", deletedItem.image);
      try {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (fileErr) {
        console.warn("Could not delete image file:", fileErr.message);
      }
    }

    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete item", error: error.message });
  }
};

// GET RECENT ACTIVITY
export const getRecentActivity = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    
    // Get recent items (sorted by updatedAt descending)
    const recentItems = await Inventory.find()
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select("itemName category quantity condition status createdAt updatedAt");
    
    // Format activity data
    const activities = recentItems.map((item) => {
      const isNew = new Date(item.createdAt).getTime() === new Date(item.updatedAt).getTime();
      
      return {
        id: item._id,
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        condition: item.condition,
        status: item.status,
        action: isNew ? "Added" : "Updated",
        timestamp: isNew ? item.createdAt : item.updatedAt,
        timeAgo: getTimeAgo(isNew ? item.createdAt : item.updatedAt),
      };
    });
    
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch activity", error: error.message });
  }
};

// Helper function to format time ago
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};