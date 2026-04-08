import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const { deliveryMethod, shippingDetails } = req.body;

    if (!deliveryMethod) {
      return res.status(400).json({ message: "Delivery method is required" });
    }

    if (deliveryMethod === "Home Delivery" && !shippingDetails) {
      return res.status(400).json({ message: "Shipping details are required for Home Delivery" });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate("items.supplementId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Calculate total amount and structured items
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      subtotal += item.price * item.quantity;
      return {
        name: item.supplementId.name,
        quantity: item.quantity,
        price: item.price,
        supplementId: item.supplementId._id,
      };
    });

    const shippingCost = deliveryMethod === "Home Delivery" ? 400 : 0;
    const totalAmount = subtotal + shippingCost;

    // Create the order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      deliveryMethod,
      shippingDetails: deliveryMethod === "Home Delivery" ? shippingDetails : undefined,
    });

    const createdOrder = await order.save();

    // Clear the cart after successful order creation
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
}

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin role typically required, using standard auth for now)
export async function getAllOrders(req, res) {
  try {
    // Populate user to get name and email
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // Sort by newest first
      
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
}

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching your orders" });
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin role typically required)
export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    const updatedOrder = await order.save();
    
    // We can also re-populate user before returning
    await updatedOrder.populate("user", "name email");

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
}
