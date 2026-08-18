const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// ==========================================
// GET USER ORDERS
// ==========================================

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Fetching orders for user:", userId);

    const orders = await Order.find({
      userId: userId,
      paymentStatus: "Paid",
      orderStatus: "Confirmed",
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
      error: error.message,
    });
  }
});


// ==========================================
// GET ALL ORDERS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
      error: error.message,
    });
  }
});


module.exports = router;