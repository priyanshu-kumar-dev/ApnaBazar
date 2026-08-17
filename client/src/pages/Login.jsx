import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      alert("Enter valid 10 digit mobile number");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://apnabazar-6zxf.onrender.com/api/auth/send-otp",
        {
          mobile,
        },
      );

      console.log("OTP Response:", response.data);

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        alert("OTP Sent Successfully");

        navigate("/verify-otp", {
          state: {
            mobile,
          },
        });
      } else {
        alert("OTP send failed");
      }
    } catch (error) {
      console.log("Send OTP Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <h1>Login</h1>

          <p>Get access to your Orders, Wishlist and Recommendations</p>
        </div>

        <div className="login-right">
          <h2>Enter Mobile Number</h2>

          <input
            type="tel"
            placeholder="Enter Mobile Number"
            value={mobile}
            maxLength="10"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");

              setMobile(value);
            }}
          />

          <button onClick={sendOTP} disabled={loading}>
            {loading ? "Sending OTP..." : "Continue"}
          </button>

          <div className="otp-info">OTP will be sent to your mobile number</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
