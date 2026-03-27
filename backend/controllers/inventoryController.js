import Inventory from "../models/Inventory.js";
import path from "path";
import fs from "fs";

// ADD ITEM
export const addItem = async (req, res) => {
  try {
    console.log("File received:", req.file); // debug

    const image = req.file ? req.file.filename : "";

    const purchase = {
      price: req.body.price ? Number(req.body.price) : undefined,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
    };

    const item = new Inventory({
      itemName: req.body.itemName,
      category: req.body.category,
      quantity: req.body.quantity,
      condition: req.body.condition,
      supplier: req.body.supplier,
      purchase,
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

    if (req.file && item.image) {
      const oldPath = path.join("uploads", item.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const purchase = {
      price: req.body.price ? Number(req.body.price) : item.purchase.price,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : item.purchase.purchaseDate,
    };

    const updatedData = {
      itemName: req.body.itemName || item.itemName,
      category: req.body.category || item.category,
      quantity: req.body.quantity || item.quantity,
      condition: req.body.condition || item.condition,
      supplier: req.body.supplier || item.supplier,
      purchase,
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

    if (deletedItem.image) {
      const imgPath = path.join("uploads", deletedItem.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete item", error: error.message });
  }
};