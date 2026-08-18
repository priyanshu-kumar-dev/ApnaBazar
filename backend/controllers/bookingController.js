const Booking = require("../models/Booking");
const Order = require("../models/Order");

// ===============================
// Create Booking
// ===============================

const createBooking = async (req, res) => {
  try {
    const {
      userId,
      service,
      price,
      paymentMethod,
      address,
    } = req.body;

    if (
      !userId ||
      !service ||
      price === undefined ||
      !paymentMethod ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const booking = await Booking.create({
      userId,
      service,
      price,
      paymentMethod,
      address,
      bookingStatus: "Pending",
      paymentStatus:
        paymentMethod === "cod"
          ? "Pending"
          : "Paid",
    });

    res.status(201).json({
      success: true,
      message: "Booking Created Successfully",
      booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ===============================
// Get All Bookings
// ===============================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get User Orders
// ===============================

const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("====================================");
    console.log("GET USER ORDERS");
    console.log("USER ID:", userId);
    console.log("====================================");

    // ==========================================
    // RAZORPAY ORDERS
    // ==========================================

    const orders = await Order.find({
      userId: userId,
      paymentStatus: "Paid",
      orderStatus: "Confirmed",
    }).sort({
      createdAt: -1,
    });

    // ==========================================
    // OLD / SERVICE BOOKINGS
    // ==========================================

    const bookings = await Booking.find({
      userId: userId,
    }).sort({
      createdAt: -1,
    });

    // ==========================================
    // COMBINE BOTH
    // ==========================================

    const allOrders = [
      ...orders.map((order) => ({
        _id: order._id,
        userId: order.userId,

        title:
          order.product?.title ||
          "Product Purchase",

        image:
          order.product?.image ||
          order.product?.selectedColorImage ||
          "",

        price: Number(order.amount) || 0,

        quantity:
          Number(order.quantity) || 1,

        status:
          order.orderStatus ||
          "Confirmed",

        paymentStatus:
          order.paymentStatus,

        paymentMethod:
          order.paymentMethod,

        date:
          order.createdAt,

        product:
          order.product,

        address:
          order.address,

        razorpayOrderId:
          order.razorpayOrderId,

        razorpayPaymentId:
          order.razorpayPaymentId,
      })),

      ...bookings.map((booking) => ({
        _id: booking._id,
        userId: booking.userId,

        title:
          booking.service ||
          "Service Booking",

        image: "",

        price:
          Number(booking.price) || 0,

        quantity: 1,

        status:
          booking.bookingStatus ||
          "Pending",

        paymentStatus:
          booking.paymentStatus,

        paymentMethod:
          booking.paymentMethod,

        date:
          booking.createdAt,

        address:
          booking.address,
      })),
    ];

    // ==========================================
    // SORT NEWEST FIRST
    // ==========================================

    allOrders.sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

    console.log(
      "ORDERS FOUND:",
      allOrders.length
    );

    res.status(200).json({
      success: true,

      totalBookings:
        allOrders.length,

      bookings:
        allOrders,
    });
  } catch (error) {
    console.error(
      "Get User Orders Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ===============================
// Get Booking By ID
// ===============================

const getBookingById = async (req, res) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "Get Booking By ID Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Update Booking Status
// ===============================

const updateBookingStatus = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        {
          bookingStatus:
            req.body.bookingStatus,

          paymentStatus:
            req.body.paymentStatus,
        },
        {
          new: true,
        }
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Booking Updated Successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Update Booking Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Delete Booking
// ===============================

const deleteBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findByIdAndDelete(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Booking Deleted Successfully",
    });
  } catch (error) {
    console.error(
      "Delete Booking Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};