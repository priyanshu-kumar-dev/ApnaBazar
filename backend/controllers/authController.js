const axios = require("axios");
const sendOTP = require("../utils/sendOTP");
const User = require("../models/User");

let otpSession = {};

// =========================
// SEND OTP
// =========================
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const normalizedMobile = mobile.startsWith("+91")
      ? mobile
      : `+91${mobile}`;

    console.log("Mobile:", normalizedMobile);

    // Send OTP through 2Factor
    const result = await sendOTP(normalizedMobile);

    console.log("OTP Result:", result);

    if (result.Status !== "Success") {
      return res.status(400).json({
        success: false,
        message: result.Details || "OTP send failed",
      });
    }

    // Save 2Factor session ID temporarily
    otpSession[normalizedMobile] = result.Details;

    // Find existing user
    let user = await User.findOne({
      mobile: normalizedMobile,
    });

    // Create user if not exists
    if (!user) {
      user = await User.create({
        mobile: normalizedMobile,
        name: "User",
        otp: null,
        otpExpiry: null,
        isVerified: false,
      });

      console.log("New User Created:", user);
    } else {
      // New OTP request means verification is pending
      user.isVerified = false;
      user.otp = null;
      user.otpExpiry = null;

      await user.save();

      console.log("OTP Request Updated:", user);
    }

    res.json({
      success: true,
      message: "OTP Sent",
    });

  } catch (error) {
    console.log(
      "SEND OTP ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "OTP send failed",
    });
  }
};


// =========================
// VERIFY OTP
// =========================
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required",
      });
    }

    const normalizedMobile = mobile.startsWith("+91")
      ? mobile
      : `+91${mobile}`;

    console.log("Verify Mobile:", normalizedMobile);
    console.log("Verify OTP:", otp);

    // Get 2Factor session ID
    const sessionId = otpSession[normalizedMobile];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "OTP session expired",
      });
    }

    // Verify OTP with 2Factor
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    console.log("Verify Response:", response.data);

    // =========================
    // OTP VERIFIED SUCCESSFULLY
    // =========================
    if (response.data.Status === "Success") {

      let user = await User.findOne({
        mobile: normalizedMobile,
      });

      // User doesn't exist
      if (!user) {

        user = await User.create({
          mobile: normalizedMobile,
          name: "User",

          // Save entered OTP
          otp: otp,

          // OTP already verified
          otpExpiry: null,

          // Mark user verified
          isVerified: true,
        });

        console.log("New User Created & Verified:", user);

      } else {

        // Save entered OTP
        user.otp = otp;

        // OTP verified, so expiry no longer needed
        user.otpExpiry = null;

        // Mark user verified
        user.isVerified = true;

        await user.save();

        console.log("Existing User Updated & Verified:", user);
      }

      // Remove temporary 2Factor session
      delete otpSession[normalizedMobile];

      res.json({
        success: true,
        message: "OTP Verified",
        user: user,
      });

    } else {

      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

  } catch (error) {

    console.log(
      "VERIFY ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};