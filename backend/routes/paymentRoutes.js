const express = require("express");

const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const router = express.Router();

// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

router.post(
  "/create-order",
  createOrder,
);

// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

router.post(
  "/verify",
  verifyPayment,
);

module.exports = router;