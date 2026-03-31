import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        supplementId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplement",
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ["Home Delivery", "Pickup at Counter"],
      required: true,
    },
    shippingDetails: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    status: {
      type: String,
      enum: ["Processing", "Ready for Pickup", "Shipped", "Delivered"],
      default: "Processing",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Paid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
