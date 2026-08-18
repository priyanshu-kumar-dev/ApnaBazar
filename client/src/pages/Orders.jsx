import React, { useEffect, useState } from "react";
import API from "../api/api";

import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET USER ID
  // ==========================================

  const getUserId = () => {
    try {
      const userData = localStorage.getItem("user");

      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      return (
        user?._id ||
        user?.id ||
        user?.userId ||
        null
      );
    } catch (error) {
      console.error("USER PARSE ERROR:", error);
      return null;
    }
  };


  // ==========================================
  // FETCH ORDERS
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = getUserId();

        console.log("Fetching orders for user:", userId);

        if (!userId) {
          console.log("User not logged in");

          setOrders([]);
          return;
        }

        const response = await API.get(
          `/orders/user/${userId}`
        );

        console.log(
          "Orders Response:",
          response.data
        );

        if (response.data?.success) {
          setOrders(
            response.data.orders || []
          );
        } else {
          setOrders([]);
        }

      } catch (error) {
        console.error(
          "FETCH ORDERS ERROR:",
          error
        );

        console.error(
          "SERVER RESPONSE:",
          error.response?.data
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="orders-page">
        <h2>My Orders</h2>

        <div className="empty-orders">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }


  // ==========================================
  // NO ORDERS
  // ==========================================

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <h2>My Orders</h2>

        <div className="empty-orders">
          <h3>No Orders Found</h3>

          <p>
            You haven't placed any orders yet.
          </p>
        </div>
      </div>
    );
  }


  // ==========================================
  // ORDERS
  // ==========================================

  return (
    <div className="orders-page">

      <h2>
        My Orders
      </h2>


      <div className="orders-list">

        {orders.map((order) => {

          const product =
            order.product || {};

          const image =
            product.selectedColorImage ||
            product.image ||
            product.images?.[0] ||
            "https://via.placeholder.com/120";


          const title =
            product.title ||
            "Product";


          const amount =
            Number(order.amount) || 0;


          const quantity =
            Number(order.quantity) || 1;


          const orderStatus =
            order.orderStatus ||
            "Confirmed";


          const paymentStatus =
            order.paymentStatus ||
            "Pending";


          const date =
            order.createdAt
              ? new Date(
                  order.createdAt
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )
              : "";


          return (
            <div
              className="order-card"
              key={order._id}
            >

              {/* PRODUCT IMAGE */}

              <img
                src={image}
                alt={title}
                className="order-image"
              />


              {/* ORDER DETAILS */}

              <div className="order-details">

                <h3>
                  {title}
                </h3>


                <p className="order-price">
                  ₹
                  {amount.toLocaleString(
                    "en-IN"
                  )}
                </p>


                <p>
                  Quantity:{" "}
                  {quantity}
                </p>


                {/* PAYMENT */}

                <p>
                  Payment:{" "}
                  <span className="paid">
                    {paymentStatus}
                  </span>
                </p>


                {/* ORDER STATUS */}

                <span
                  className={`status ${orderStatus
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`}
                >
                  {orderStatus}
                </span>


                {/* DATE */}

                <p className="date">
                  Ordered on {date}
                </p>


                {/* RAZORPAY */}

                {order.razorpayPaymentId && (
                  <p className="payment-id">
                    Payment ID:{" "}
                    {order.razorpayPaymentId}
                  </p>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default Orders;