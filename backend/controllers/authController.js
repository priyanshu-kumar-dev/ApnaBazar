const axios = require("axios");
const sendOTP = require("../utils/sendOTP");
const User = require("../models/User");

let otpSession = {};

// SEND OTP
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    const normalizedMobile = mobile.startsWith("+91")
      ? mobile
      : `+91${mobile}`;

    console.log("Mobile:", normalizedMobile);

    const result = await sendOTP(normalizedMobile);

    console.log("OTP Result:", result);

    if (result.Status !== "Success") {
      return res.status(400).json({
        success: false,
        message: result.Details || "OTP send failed",
      });
    }

    otpSession[normalizedMobile] = result.Details;

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


// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const normalizedMobile = mobile.startsWith("+91")
      ? mobile
      : `+91${mobile}`;

    console.log("Verify Mobile:", normalizedMobile);
    console.log("Verify OTP:", otp);

    const sessionId = otpSession[normalizedMobile];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "OTP session expired",
      });
    }

    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    console.log("Verify Response:", response.data);

    if (response.data.Status === "Success") {

      let user = await User.findOne({
        mobile: normalizedMobile,
      });

      if (!user) {
        user = await User.create({
          mobile: normalizedMobile,
          name: "User",
        });

        console.log("New User Created:", user);
      } else {
        console.log("Existing User:", user);
      }

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