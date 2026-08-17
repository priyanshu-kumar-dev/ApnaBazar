const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // =====================================================
    // PRODUCT
    // =====================================================

    product: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    // =====================================================
    // AMOUNT
    // =====================================================

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // =====================================================
    // ADDRESS
    // =====================================================

    address: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // =====================================================
    // PAYMENT
    // =====================================================

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "COD"],
      default: "Pending",
    },

    // =====================================================
    // RAZORPAY
    // =====================================================

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    // =====================================================
    // ORDER STATUS
    // =====================================================

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    receipt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);