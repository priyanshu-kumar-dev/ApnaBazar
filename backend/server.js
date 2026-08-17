const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

// =====================================================
// TEST API
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "ApnaBazarKart server is running",
  });
});

// =====================================================
// AUTH
// =====================================================

const authRoutes = require("./routes/auth");

app.use(
  "/api/auth",
  authRoutes,
);

// =====================================================
// BOOKING
// =====================================================

const bookingRoutes =
  require("./routes/bookingRoutes");

app.use(
  "/api/bookings",
  bookingRoutes,
);

// =====================================================
// ADDRESS
// =====================================================

const addressRoutes =
  require("./routes/addressRoutes");

app.use(
  "/api/addresses",
  addressRoutes,
);

// =====================================================
// RAZORPAY PAYMENT
// =====================================================

const paymentRoutes =
  require("./routes/paymentRoutes");

app.use(
  "/api/payments",
  paymentRoutes,
);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,

    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err,
    );

    res.status(500).json({
      success: false,

      message:
        "Internal server error",

      error:
        err.message,
    });
  },
);

// =====================================================
// SERVER
// =====================================================

const PORT = 5000;

app.listen(
  PORT,
  () => {
    console.log(
      "========================================",
    );

    console.log(
      `Server running on http://localhost:${PORT}`,
    );

    console.log(
      "Auth API     : /api/auth",
    );

    console.log(
      "Booking API  : /api/bookings",
    );

    console.log(
      "Address API  : /api/addresses",
    );

    console.log(
      "Payment API  : /api/payments",
    );

    console.log(
      "========================================",
    );
  },
);