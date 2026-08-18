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

      if (!userData) return null;

      const user = JSON.parse(userData);

      return user?._id || user?.id || user?.userId || null;
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
          setOrders([]);
          return;
        }

        const response = await API.get(`/orders/user/${userId}`);

        console.log("Orders Response:", response.data);

        if (response.data?.success) {
          setOrders(response.data.orders || []);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("FETCH ORDERS ERROR:", error);
        console.error("SERVER RESPONSE:", error.response?.data);

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // ADD DAYS TO DATE
  // ==========================================

  const addDays = (date, days) => {
    if (!date) return null;

    const newDate = new Date(date);

    if (Number.isNaN(newDate.getTime())) {
      return null;
    }

    newDate.setDate(newDate.getDate() + days);

    return newDate;
  };

  // ==========================================
  // GET DELIVERY DATE
  // ==========================================

  const getDeliveryDate = (order) => {
    return (
      order.expectedDeliveryDate ||
      order.deliveryDate ||
      order.estimatedDeliveryDate ||
      order.deliveredAt ||
      null
    );
  };

  // ==========================================
  // FALLBACK DELIVERY DATE
  // ==========================================

  const getEstimatedDate = (order) => {
    const existingDate = getDeliveryDate(order);

    if (existingDate) {
      return existingDate;
    }

    if (!order.createdAt) {
      return null;
    }

    /*
      Agar backend delivery date nahi bhej raha hai
      to order date ke 5 din baad ko expected delivery
      maana jayega.
    */

    return addDays(order.createdAt, 5);
  };

  // ==========================================
  // NORMALIZE STATUS
  // ==========================================

  const getStatus = (order) => {
    const status = String(order.orderStatus || order.status || "Confirmed")
      .trim()
      .toLowerCase();

    if (status.includes("cancel")) {
      return "Cancelled";
    }

    if (status.includes("deliver") && !status.includes("out")) {
      return "Delivered";
    }

    if (status.includes("out") || status.includes("delivery")) {
      return "Out for Delivery";
    }

    if (status.includes("ship")) {
      return "Shipped";
    }

    if (status.includes("process")) {
      return "Processing";
    }

    if (status.includes("confirm")) {
      return "Confirmed";
    }

    return "Confirmed";
  };

  // ==========================================
  // STATUS MESSAGE
  // ==========================================

  const getStatusMessage = (status, order) => {
    const deliveryDate = getDeliveryDate(order) || getEstimatedDate(order);

    switch (status) {
      case "Delivered":
        return order.deliveredAt
          ? `Your item was delivered on ${formatDate(order.deliveredAt)}`
          : "Your item has been delivered";

      case "Out for Delivery":
        return deliveryDate
          ? `Delivery expected today`
          : "Your item is out for delivery";

      case "Shipped":
        return deliveryDate
          ? `Delivery expected by ${formatDate(deliveryDate)}`
          : "Your item has been shipped";

      case "Processing":
        return deliveryDate
          ? `Delivery expected by ${formatDate(deliveryDate)}`
          : "Your item is being prepared";

      case "Confirmed":
        return deliveryDate
          ? `Delivery expected by ${formatDate(deliveryDate)}`
          : "Your order has been confirmed";

      case "Cancelled":
        return "This order has been cancelled";

      default:
        return "";
    }
  };

  // ==========================================
  // GET PRODUCT ITEMS
  // ==========================================

  const getOrderItems = (order) => {
    /*
      Backend agar items array bhej raha hai:

      {
        items: [...]
      }

      to multiple products show honge.

      Agar single product hai:

      {
        product: {...}
      }

      to single product show hoga.
    */

    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items.map((item) => ({
        ...order,
        product: item.product || item,
        amount: item.amount ?? item.price ?? order.amount,
        quantity: item.quantity ?? order.quantity ?? 1,
      }));
    }

    return [
      {
        ...order,
        product: order.product || {},
        amount: order.amount,
        quantity: order.quantity || 1,
      },
    ];
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <h2 className="orders-heading">My Orders</h2>

          <div className="empty-orders">
            <p>Loading orders...</p>
          </div>
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
        <div className="orders-container">
          <h2 className="orders-heading">My Orders</h2>

          <div className="empty-orders">
            <h3>No Orders Found</h3>

            <p>You haven't placed any orders yet.</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ORDERS
  // ==========================================

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h2 className="orders-heading">My Orders</h2>

        <div className="orders-list">
          {orders.map((order) => {
            const orderItems = getOrderItems(order);

            return orderItems.map((item, index) => {
              const product = item.product || {};

              // ------------------------------
              // IMAGE
              // ------------------------------

              const image =
                product.selectedColorImage ||
                product.image ||
                product.images?.[0] ||
                product.thumbnail ||
                "https://via.placeholder.com/150";

              // ------------------------------
              // TITLE
              // ------------------------------

              const title = product.title || product.name || "Product";

              // ------------------------------
              // COLOR
              // ------------------------------

              const color =
                product.selectedColor || product.color || product.colour || "";

              // ------------------------------
              // VARIANT
              // ------------------------------

              const variant =
                product.selectedVariant || product.variant || null;

              let variantText = "";

              if (typeof variant === "string") {
                variantText = variant;
              } else if (variant) {
                variantText =
                  variant.name || variant.ram || variant.storage || "";
              }

              // ------------------------------
              // SIZE
              // ------------------------------

              const size = product.selectedSize || product.size || "";

              // ------------------------------
              // PRICE
              // ------------------------------

              const amount = Number(item.amount) || 0;

              const quantity = Number(item.quantity) || 1;

              // ------------------------------
              // STATUS
              // ------------------------------

              const orderStatus = getStatus(item);

              const statusMessage = getStatusMessage(orderStatus, item);

              // ------------------------------
              // DATES
              // ------------------------------

              const orderedDate = item.createdAt
                ? formatDate(item.createdAt)
                : "";

              const deliveryDate =
                getDeliveryDate(item) || getEstimatedDate(item);

              const formattedDeliveryDate = deliveryDate
                ? formatDate(deliveryDate)
                : "";

              // ------------------------------
              // SHARED ORDER
              // ------------------------------

              const sharedBy =
                item.sharedBy ||
                item.sharedByName ||
                order.sharedBy ||
                order.sharedByName ||
                "";

              // ------------------------------
              // PAYMENT
              // ------------------------------

              const paymentStatus =
                item.paymentStatus || order.paymentStatus || "Pending";

              // ------------------------------
              // PAYMENT ID
              // ------------------------------

              const paymentId =
                item.razorpayPaymentId || order.razorpayPaymentId || "";

              return (
                <div
                  className={`order-card ${orderStatus
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  key={`${order._id}-${index}`}
                >
                  {/* =========================
                        SHARED ORDER
                    ========================= */}

                  {sharedBy && (
                    <div className="shared-order">
                      {sharedBy} shared this order with you.
                    </div>
                  )}

                  <div className="order-main">
                    {/* =======================
                          PRODUCT IMAGE
                      ======================= */}

                    <div className="order-image-box">
                      <img src={image} alt={title} className="order-image" />
                    </div>

                    {/* =======================
                          PRODUCT INFORMATION
                      ======================= */}

                    <div className="order-product">
                      <h3 className="product-title">{title}</h3>

                      {color && (
                        <p className="product-option">Color: {color}</p>
                      )}

                      {variantText && (
                        <p className="product-option">{variantText}</p>
                      )}

                      {size && <p className="product-option">Size: {size}</p>}

                      <p className="product-quantity">Qty: {quantity}</p>

                      <div className="mobile-price">
                        ₹{amount.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* =======================
                          PRICE
                      ======================= */}

                    <div className="order-price-box">
                      <div className="order-price">
                        ₹{amount.toLocaleString("en-IN")}
                      </div>

                      {quantity > 1 && (
                        <div className="price-qty">Qty: {quantity}</div>
                      )}
                    </div>

                    {/* =======================
                          DELIVERY STATUS
                      ======================= */}

                    <div className="order-delivery">
                      <div
                        className={`delivery-status ${orderStatus
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        <span className="status-dot">
                          {orderStatus === "Cancelled" ? "×" : "✓"}
                        </span>

                        <span>{orderStatus}</span>
                      </div>

                      <p className="delivery-message">{statusMessage}</p>

                      {/* EXPECTED DELIVERY */}

                      {orderStatus !== "Delivered" &&
                        orderStatus !== "Cancelled" &&
                        formattedDeliveryDate && (
                          <p className="delivery-date">
                            <strong>Delivery by </strong>
                            {formattedDeliveryDate}
                          </p>
                        )}

                      {/* DELIVERED DATE */}

                      {orderStatus === "Delivered" && item.deliveredAt && (
                        <p className="delivery-date delivered-date">
                          Delivered on{" "}
                          <strong>{formatDate(item.deliveredAt)}</strong>
                        </p>
                      )}

                      {/* ORDERED DATE */}

                      {orderedDate && (
                        <p className="ordered-date">Ordered on {orderedDate}</p>
                      )}

                      {/* REVIEW */}

                      {orderStatus === "Delivered" && (
                        <button
                          className="review-btn"
                          type="button"
                          onClick={() => {
                            console.log("Review product:", product);
                          }}
                        >
                          ★ &nbsp; Rate & Review Product
                        </button>
                      )}
                    </div>
                  </div>

                  {/* =========================
                        PAYMENT INFORMATION
                    ========================= */}

                  <div className="order-bottom">
                    <div className="payment-info">
                      <span className="payment-label">Payment:</span>

                      <span
                        className={`payment-status ${String(paymentStatus)
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {paymentStatus}
                      </span>
                    </div>

                    {paymentId && (
                      <div className="payment-id">Payment ID: {paymentId}</div>
                    )}
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
