import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import "./VerifyOTP.css";
import OTPInput from "../components/OTPInput";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mobile = location.state?.mobile;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      alert("Please enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",

        {
          mobile,
          otp,
        },
      );

      console.log("Verify Response:", response.data);

      if (response.data.success) {
        alert("Login Successful");

        localStorage.setItem("mobile", mobile);

        localStorage.setItem("user", JSON.stringify(response.data.user));

        const from = location.state;

        if (from?.from === "payment") {
          navigate("/payment", {
            state: {
              service: from.service,
              price: from.price,
              address: from.address,
            },
          });
        } else {
          navigate("/");
        }
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.log("OTP Verify Error:", error.response?.data || error.message);

      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">
        <div className="otp-left">
          <h1>Login</h1>

          <p>Get access to your Orders, Wishlist and Recommendations</p>
        </div>

        <div className="otp-right">
          <h2>Verify OTP</h2>

          <p>
            OTP sent to
            <br />
            <b>+91 {mobile}</b>
          </p>

          <OTPInput otp={otp} setOtp={setOtp} />

          <button onClick={verifyOTP} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
