import React from "react";
import { useNavigate } from "react-router-dom";

function Success() {
  const navigate = useNavigate();

  const goToOrders = () => {
    navigate("/orders");
  };

  const continueShopping = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f3f6",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "10px",
          textAlign: "center",
          width: "500px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontSize: "70px" }}>✅</div>

        <h1 style={{ color: "green" }}>
          Order Placed Successfully!
        </h1>

        <p style={{ color: "#555", marginTop: "15px" }}>
          Thank you for shopping with ApnaBazar.
        </p>

        <p style={{ color: "#777" }}>
          Your order has been confirmed and will be delivered soon.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <button
            onClick={goToOrders}
            style={{
              padding: "12px 25px",
              background: "#2874f0",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            My Orders
          </button>

          <button
            onClick={continueShopping}
            style={{
              padding: "12px 25px",
              background: "#fb641b",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;