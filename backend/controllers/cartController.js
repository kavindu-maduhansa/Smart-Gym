// backend/controllers/cartController.js
// Controller for cart-related operations

import Cart from "../models/Cart.js";
import Supplement from "../models/Supplement.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export async function getCart(req, res) {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate(
      "items.supplementId",
      "name price image"
    );

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
      await cart.save();
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Error fetching cart" });
  }
}

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { supplementId, quantity } = req.body;

    if (!supplementId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid supplement or quantity" });
    }

    // Check if supplement exists and has sufficient stock
    const supplement = await Supplement.findById(supplementId);
    if (!supplement) {
      return res.status(404).json({ message: "Supplement not found" });
    }

    if (supplement.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ userId });

    // Create cart if doesn't exist
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.supplementId.toString() === supplementId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        supplementId,
        quantity,
        price: supplement.price,
      });
    }

    // Calculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();
    await cart.populate("items.supplementId", "name price image");

    return res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Error adding to cart" });
  }
}

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export async function updateCartItem(req, res) {
  try {
    const userId = req.user.id;
    const { supplementId, quantity } = req.body;

    if (!supplementId || !quantity || quantity < 0) {
      return res.status(400).json({ message: "Invalid supplement or quantity" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (quantity === 0) {
      // Remove item
      cart.items = cart.items.filter(
        (item) => item.supplementId.toString() !== supplementId
      );
    } else {
      // Update quantity
      const item = cart.items.find(
        (item) => item.supplementId.toString() === supplementId
      );

      if (item) {
        const supplement = await Supplement.findById(supplementId);
        if (supplement.quantity < quantity) {
          return res.status(400).json({ message: "Insufficient stock" });
        }
        item.quantity = quantity;
      } else {
        return res.status(404).json({ message: "Item not found in cart" });
      }
    }

    // Calculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();
    await cart.populate("items.supplementId", "name price image");

    return res.status(200).json({
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({ message: "Error updating cart" });
  }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:supplementId
// @access  Private
export async function removeFromCart(req, res) {
  try {
    const userId = req.user.id;
    const { supplementId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.supplementId.toString() !== supplementId
    );

    // Calculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();
    await cart.populate("items.supplementId", "name price image");

    return res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({ message: "Error removing from cart" });
  }
}

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export async function clearCart(req, res) {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({ message: "Error clearing cart" });
  }
}
