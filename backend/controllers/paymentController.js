const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../models/Order");

// =====================================================
// RAZORPAY INSTANCE
// =====================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      product,
      quantity,
      amount,
      currency,
      receipt,
      address,
    } = req.body;

    console.log("====================================");
    console.log("CREATE RAZORPAY ORDER");
    console.log("BODY:", req.body);
    console.log("====================================");

    // =================================================
    // VALIDATION
    // =================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product is required",
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    // =================================================
    // AMOUNT TO PAISE
    // =================================================

    const amountInPaise = Math.round(
      Number(amount) * 100,
    );

    // =================================================
    // RAZORPAY ORDER
    // =================================================

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,

        currency: currency || "INR",

        receipt:
          receipt ||
          `receipt_${Date.now()}`,

        notes: {
          userId: String(userId),

          productId:
            product._id ||
            product.id ||
            "",

          productTitle:
            product.title ||
            "Product Purchase",
        },
      });

    console.log(
      "RAZORPAY ORDER CREATED:",
      razorpayOrder,
    );

    // =================================================
    // SAVE PENDING ORDER IN MONGODB
    // =================================================

    const order = await Order.create({
      userId,

      product,

      quantity:
        Number(quantity) || 1,

      amount: Number(amount),

      currency:
        currency || "INR",

      address,

      paymentMethod: "Razorpay",

      paymentStatus: "Pending",

      razorpayOrderId:
        razorpayOrder.id,

      receipt:
        razorpayOrder.receipt,

      orderStatus: "Pending",
    });

    console.log(
      "MONGODB ORDER CREATED:",
      order._id,
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Razorpay order created successfully",

      keyId:
        process.env.RAZORPAY_KEY_ID,

      order: razorpayOrder,

      mongoOrderId:
        order._id,
    });
  } catch (error) {
    console.error(
      "CREATE RAZORPAY ORDER ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to create Razorpay order",

      error: error.message,
    });
  }
};

// =====================================================
// VERIFY PAYMENT
// =====================================================

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      userId,
      product,
      quantity,
      amount,
      address,
    } = req.body;

    console.log("====================================");
    console.log("VERIFY PAYMENT");
    console.log("BODY:", req.body);
    console.log("====================================");

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment details are missing",
      });
    }

    // =================================================
    // CREATE SIGNATURE
    // =================================================

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET,
        )
        .update(body)
        .digest("hex");

    // =================================================
    // VERIFY SIGNATURE
    // =================================================

    const isValid =
      expectedSignature ===
      razorpay_signature;

    if (!isValid) {
      console.error(
        "INVALID RAZORPAY SIGNATURE",
      );

      return res.status(400).json({
        success: false,
        message:
          "Payment signature verification failed",
      });
    }

    // =================================================
    // FIND ORDER
    // =================================================

    let order =
      await Order.findOne({
        razorpayOrderId:
          razorpay_order_id,
      });

    // =================================================
    // FALLBACK - CREATE ORDER
    // =================================================

    if (!order) {
      if (
        !userId ||
        !product ||
        !address ||
        !amount
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order information missing",
        });
      }

      order =
        await Order.create({
          userId,

          product,

          quantity:
            Number(quantity) || 1,

          amount:
            Number(amount),

          currency: "INR",

          address,

          paymentMethod:
            "Razorpay",

          paymentStatus:
            "Pending",

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

          orderStatus:
            "Confirmed",
        });
    } else {
      // ===============================================
      // UPDATE EXISTING ORDER
      // ===============================================

      order.paymentStatus =
        "Paid";

      order.paymentMethod =
        "Razorpay";

      order.razorpayPaymentId =
        razorpay_payment_id;

      order.razorpaySignature =
        razorpay_signature;

      order.orderStatus =
        "Confirmed";

      await order.save();
    }

    console.log(
      "PAYMENT VERIFIED SUCCESSFULLY:",
      order._id,
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      order,
    });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Payment verification failed",

      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};