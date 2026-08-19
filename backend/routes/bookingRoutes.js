const express = require("express");

const router = express.Router();

const {
  createBooking,

  getAllBookings,

  getUserBookings,

  getBookingById,

  updateBookingStatus,

  deleteBooking,
} = require("../controllers/bookingController");

// ===============================
// Create Booking
// POST /api/bookings/create
// ===============================

router.post("/create", createBooking);

// ===============================
// Get All Bookings (Admin)
// GET /api/bookings/all
// ===============================

router.get("/all", getAllBookings);

// ===============================
// Get User Booking History
// GET /api/bookings/user/:userId
// ===============================

router.get("/user/:userId", getUserBookings);

// ===============================
// Get Single Booking
// GET /api/bookings/:id
// ===============================

router.get("/:id", getBookingById);

// ===============================
// Update Booking Status
// PUT /api/bookings/update/:id
// ===============================

router.put("/update/:id", updateBookingStatus);

// ===============================
// Delete Booking
// DELETE /api/bookings/delete/:id
// ===============================

router.delete("/delete/:id", deleteBooking);

module.exports = router;
