require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookingRoutes");
const addressRoutes = require("./routes/addressRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://apnabazar-1.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  })
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(cookieParser());

// =====================================================
// TEST API
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ApnaBazarKart server is running",
  });
});

// =====================================================
// AUTH
// =====================================================

app.use("/api/auth", authRoutes);

// =====================================================
// BOOKING
// =====================================================

app.use("/api/bookings", bookingRoutes);

// =====================================================
// ADDRESS
// =====================================================

app.use("/api/addresses", addressRoutes);

// =====================================================
// RAZORPAY PAYMENT
// =====================================================

app.use("/api/payments", paymentRoutes);

// =====================================================
// ORDERS
// =====================================================

app.use("/api/orders", orderRoutes);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log(`Server running on port ${PORT}`);
  console.log("Auth API     : /api/auth");
  console.log("Booking API  : /api/bookings");
  console.log("Address API  : /api/addresses");
  console.log("Payment API  : /api/payments");
  console.log("Orders API   : /api/orders");
  console.log("========================================");
});