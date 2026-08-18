import React from "react";
import { useNavigate } from "react-router-dom";
import "./BookingSuccess.css";

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <div className="success-card">
        <h1>✅ Booking Confirmed</h1>

        <p>Your service provider will contact you soon.</p>

        <button onClick={() => navigate("/orders")}>Go to Orders</button>
      </div>
    </div>
  );
};

export default BookingSuccess;
