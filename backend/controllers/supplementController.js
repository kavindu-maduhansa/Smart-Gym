// backend/controllers/supplementController.js
// Controller for supplement-related operations

import Supplement from "../models/Supplement.js";

// @desc    Get all supplements
// @route   GET /api/supplements
// @access  Public
export async function getAllSupplements(req, res) {
  try {
    const supplements = await Supplement.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return res.status(200).json(supplements);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return res.status(500).json({ message: "Error fetching supplements" });
  }
}

// @desc    Get supplement by ID
// @route   GET /api/supplements/:id
// @access  Public
export async function getSupplementById(req, res) {
  try {
    const { id } = req.params;
    const supplement = await Supplement.findById(id);

    if (!supplement) {
      return res.status(404).json({ message: "Supplement not found" });
    }

    return res.status(200).json(supplement);
  } catch (error) {
    console.error("Error fetching supplement:", error);
    return res.status(500).json({ message: "Error fetching supplement" });
  }
}

// @desc    Create a new supplement (Admin only)
// @route   POST /api/supplements
// @access  Private/Admin
export async function createSupplement(req, res) {
  try {
    const { name, description, category, price, quantity, brand, servingSize, image } =
      req.body;

    // Validate required fields
    if (!name || !description || !category || !price || !brand || !servingSize) {
      return res.status(400).json({
        message:
          "Please provide all required fields: name, description, category, price, brand, servingSize",
      });
    }

    // Check if supplement already exists
    const existingSupplement = await Supplement.findOne({ name });
    if (existingSupplement) {
      return res
        .status(400)
        .json({ message: "Supplement with this name already exists" });
    }

    // Create new supplement
    const supplement = new Supplement({
      name,
      description,
      category,
      price,
      quantity: quantity || 0,
      brand,
      servingSize,
      image,
      isActive: true,
    });

    await supplement.save();
    return res.status(201).json({
      message: "Supplement created successfully",
      supplement,
    });
  } catch (error) {
    console.error("Error creating supplement:", error);
    return res.status(500).json({ message: "Error creating supplement" });
  }
}

// @desc    Update a supplement (Admin only)
// @route   PUT /api/supplements/:id
// @access  Private/Admin
export async function updateSupplement(req, res) {
  try {
    const { id } = req.params;
    const { name, description, category, price, quantity, brand, servingSize, image } =
      req.body;

    let supplement = await Supplement.findById(id);

    if (!supplement) {
      return res.status(404).json({ message: "Supplement not found" });
    }

    // Update fields if provided
    if (name) supplement.name = name;
    if (description) supplement.description = description;
    if (category) supplement.category = category;
    if (price !== undefined) supplement.price = price;
    if (quantity !== undefined) supplement.quantity = quantity;
    if (brand) supplement.brand = brand;
    if (servingSize) supplement.servingSize = servingSize;
    if (image) supplement.image = image;

    await supplement.save();

    return res.status(200).json({
      message: "Supplement updated successfully",
      supplement,
    });
  } catch (error) {
    console.error("Error updating supplement:", error);
    return res.status(500).json({ message: "Error updating supplement" });
  }
}

// @desc    Delete a supplement (Admin only)
// @route   DELETE /api/supplements/:id
// @access  Private/Admin
export async function deleteSupplement(req, res) {
  try {
    const { id } = req.params;

    const supplement = await Supplement.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!supplement) {
      return res.status(404).json({ message: "Supplement not found" });
    }

    return res.status(200).json({
      message: "Supplement deleted successfully",
      supplement,
    });
  } catch (error) {
    console.error("Error deleting supplement:", error);
    return res.status(500).json({ message: "Error deleting supplement" });
  }
}

// @desc    Get all supplements (including inactive) - Admin only
// @route   GET /api/supplements/admin/all
// @access  Private/Admin
export async function getAllSupplementsAdmin(req, res) {
  try {
    const supplements = await Supplement.find().sort({ createdAt: -1 });
    return res.status(200).json(supplements);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return res.status(500).json({ message: "Error fetching supplements" });
  }
}
