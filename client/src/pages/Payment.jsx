import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FaGooglePay,
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
} from "react-icons/fa";

import "./Payment.css";

const Payment = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [orderData, setOrderData] =
    useState(null);

  const [selectedMethod, setSelectedMethod] =
    useState("razorpay");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // LOAD ORDER SUMMARY
  // =====================================================

  useEffect(() => {
    try {
      const savedOrder =
        localStorage.getItem(
          "orderSummary",
        );

      if (!savedOrder) {
        alert(
          "Order details not found",
        );

        navigate("/order-summary");

        return;
      }

      const parsedOrder =
        JSON.parse(savedOrder);

      console.log(
        "ORDER SUMMARY:",
        parsedOrder,
      );

      if (!parsedOrder?.product) {
        alert(
          "Product details missing",
        );

        navigate("/order-summary");

        return;
      }

      if (!parsedOrder?.address) {
        alert(
          "Please select delivery address first",
        );

        navigate("/order-summary");

        return;
      }

      if (
        !parsedOrder?.totalAmount ||
        Number(parsedOrder.totalAmount) <= 0
      ) {
        alert(
          "Order amount missing",
        );

        navigate("/order-summary");

        return;
      }

      setOrderData(
        parsedOrder,
      );
    } catch (error) {
      console.error(
        "ORDER DATA ERROR:",
        error,
      );

      alert(
        "Invalid order details",
      );

      navigate("/order-summary");
    }
  }, [navigate]);

  // =====================================================
  // GET USER
  // =====================================================

  const getUser = () => {
    try {
      const userData =
        localStorage.getItem(
          "user",
        );

      if (!userData) {
        return null;
      }

      const user =
        JSON.parse(userData);

      return user;
    } catch (error) {
      console.error(
        "USER PARSE ERROR:",
        error,
      );

      return null;
    }
  };

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = (user) => {
    return (
      user?._id ||
      user?.id ||
      user?.userId ||
      null
    );
  };

  // =====================================================
  // RAZORPAY PAYMENT
  // =====================================================

  const startRazorpayPayment =
    async () => {
      if (!orderData) {
        alert(
          "Order details not found",
        );

        return;
      }

      const user =
        getUser();

      if (!user) {
        alert(
          "Please login first",
        );

        navigate("/login");

        return;
      }

      const userId =
        getUserId(user);

      if (!userId) {
        alert(
          "User ID not found. Please login again.",
        );

        navigate("/login");

        return;
      }

      if (!orderData.address) {
        alert(
          "Please select delivery address",
        );

        navigate(
          "/order-summary",
        );

        return;
      }

      const totalAmount =
        Number(
          orderData.totalAmount,
        );

      if (
        !totalAmount ||
        totalAmount <= 0
      ) {
        alert(
          "Invalid payment amount",
        );

        return;
      }

      try {
        setLoading(true);

        // =================================================
        // CREATE RAZORPAY ORDER
        // =================================================

        const response =
          await API.post(
            "/payments/create-order",
            {
              userId,

              product:
                orderData.product,

              quantity:
                Number(
                  orderData.quantity,
                ) || 1,

              amount:
                totalAmount,

              currency:
                "INR",

              receipt:
                `receipt_${Date.now()}`,

              address:
                orderData.address,
            },
          );

        console.log(
          "RAZORPAY ORDER RESPONSE:",
          response.data,
        );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
              "Unable to create Razorpay order",
          );
        }

        const razorpayOrder =
          response.data.order;

        if (
          !razorpayOrder?.id
        ) {
          throw new Error(
            "Razorpay order ID missing",
          );
        }

        // =================================================
        // RAZORPAY OPTIONS
        // =================================================

        const options = {
          key:
            response.data.keyId,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency,

          name:
            "ApnaBazarKart",

          description:
            orderData.product?.title ||
            "Product Purchase",

          order_id:
            razorpayOrder.id,

          prefill: {
            name:
              user.name ||
              orderData.address.name ||
              "",

            contact:
              user.mobile ||
              orderData.address.mobile ||
              "",

            email:
              user.email ||
              "",
          },

          notes: {
            userId:
              String(userId),

            addressId:
              String(
                orderData.address
                  ?._id ||
                  "",
              ),
          },

          theme: {
            color:
              "#2874f0",
          },

          // =================================================
          // SUCCESS
          // =================================================

          handler:
            async (
              paymentResponse,
            ) => {
              console.log(
                "RAZORPAY PAYMENT SUCCESS:",
                paymentResponse,
              );

              try {
                setLoading(
                  true,
                );

                // =========================================
                // VERIFY PAYMENT
                // =========================================

                const verifyResponse =
                  await API.post(
                    "/payments/verify",
                    {
                      razorpay_order_id:
                        paymentResponse.razorpay_order_id,

                      razorpay_payment_id:
                        paymentResponse.razorpay_payment_id,

                      razorpay_signature:
                        paymentResponse.razorpay_signature,

                      userId,

                      product:
                        orderData.product,

                      quantity:
                        Number(
                          orderData.quantity,
                        ) || 1,

                      amount:
                        totalAmount,

                      address:
                        orderData.address,
                    },
                  );

                console.log(
                  "PAYMENT VERIFY RESPONSE:",
                  verifyResponse.data,
                );

                if (
                  !verifyResponse
                    .data
                    ?.success
                ) {
                  throw new Error(
                    verifyResponse
                      .data
                      ?.message ||
                      "Payment verification failed",
                  );
                }

                // =========================================
                // COMPLETED ORDER
                // =========================================

                const completedOrder =
                  {
                    ...orderData,

                    paymentMethod:
                      "Razorpay",

                    paymentStatus:
                      "Paid",

                    razorpayOrderId:
                      paymentResponse
                        .razorpay_order_id,

                    razorpayPaymentId:
                      paymentResponse
                        .razorpay_payment_id,

                    orderId:
                      verifyResponse
                        .data
                        ?.order
                        ?._id ||
                      response.data
                        ?.mongoOrderId ||
                      null,

                    orderStatus:
                      "Confirmed",
                  };

                // =========================================
                // SAVE
                // =========================================

                localStorage.setItem(
                  "completedOrder",
                  JSON.stringify(
                    completedOrder,
                  ),
                );

                localStorage.removeItem(
                  "orderSummary",
                );

                localStorage.removeItem(
                  "buyProduct",
                );

                alert(
                  "Payment Successful!",
                );

                navigate(
                  "/booking-success",
                  {
                    state:
                      completedOrder,
                  },
                );
              } catch (error) {
                console.error(
                  "PAYMENT VERIFY ERROR:",
                  error,
                );

                console.error(
                  "SERVER RESPONSE:",
                  error.response
                    ?.data,
                );

                alert(
                  error.response
                    ?.data
                    ?.message ||
                    error.message ||
                    "Payment verification failed",
                );
              } finally {
                setLoading(
                  false,
                );
              }
            },

          // =================================================
          // CLOSE CHECKOUT
          // =================================================

          modal: {
            ondismiss:
              () => {
                console.log(
                  "Razorpay checkout closed",
                );

                setLoading(
                  false,
                );
              },
          },
        };

        // =================================================
        // CHECK RAZORPAY SDK
        // =================================================

        if (
          !window.Razorpay
        ) {
          alert(
            "Razorpay SDK load nahi hua. index.html check karo.",
          );

          setLoading(
            false,
          );

          return;
        }

        // =================================================
        // OPEN RAZORPAY
        // =================================================

        const razorpay =
          new window.Razorpay(
            options,
          );

        // =================================================
        // PAYMENT FAILED
        // =================================================

        razorpay.on(
          "payment.failed",
          (response) => {
            console.error(
              "RAZORPAY PAYMENT FAILED:",
              response,
            );

            alert(
              response.error
                ?.description ||
                "Payment failed",
            );

            setLoading(
              false,
            );
          },
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "RAZORPAY PAYMENT ERROR:",
          error,
        );

        console.error(
          "SERVER RESPONSE:",
          error.response
            ?.data,
        );

        alert(
          error.response
            ?.data
            ?.message ||
            error.message ||
            "Unable to start payment",
        );

        setLoading(
          false,
        );
      }
    };

  // =====================================================
  // CASH ON DELIVERY
  // =====================================================

  const handleCOD =
    async () => {
      if (!orderData) {
        alert(
          "Order details not found",
        );

        return;
      }

      const user =
        getUser();

      if (!user) {
        alert(
          "Please login first",
        );

        navigate("/login");

        return;
      }

      const userId =
        getUserId(user);

      if (!userId) {
        alert(
          "User ID not found",
        );

        return;
      }

      if (!orderData.address) {
        alert(
          "Please select delivery address",
        );

        return;
      }

      try {
        setLoading(
          true,
        );

        const response =
          await API.post(
            "/bookings/create",
            {
              userId,

              service:
                orderData.product
                  ?.title ||
                "Product Purchase",

              price:
                Number(
                  orderData.totalAmount,
                ),

              address:
                orderData.address,

              paymentMethod:
                "cod",

              paymentStatus:
                "Pending",
            },
          );

        console.log(
          "COD RESPONSE:",
          response.data,
        );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
              "COD order failed",
          );
        }

        const completedOrder =
          {
            ...orderData,

            paymentMethod:
              "Cash on Delivery",

            paymentStatus:
              "Pending",

            orderStatus:
              "Confirmed",

            orderId:
              response.data
                ?.booking
                ?._id ||
              null,
          };

        localStorage.setItem(
          "completedOrder",
          JSON.stringify(
            completedOrder,
          ),
        );

        localStorage.removeItem(
          "orderSummary",
        );

        localStorage.removeItem(
          "buyProduct",
        );

        alert(
          "Order placed successfully!",
        );

        navigate(
          "/booking-success",
          {
            state:
              completedOrder,
          },
        );
      } catch (error) {
        console.error(
          "COD ERROR:",
          error,
        );

        alert(
          error.response
            ?.data
            ?.message ||
            error.message ||
            "COD order failed",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  // =====================================================
  // PAYMENT BUTTON
  // =====================================================

  const handlePayment =
    () => {
      if (
        selectedMethod ===
        "cod"
      ) {
        handleCOD();

        return;
      }

      startRazorpayPayment();
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (!orderData) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          Loading payment details...
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const product =
    orderData.product;

  const quantity =
    Number(
      orderData.quantity,
    ) || 1;

  const totalAmount =
    Number(
      orderData.totalAmount,
    ) || 0;

  const address =
    orderData.address;

  // =====================================================
  // FULL ADDRESS
  // =====================================================

  const fullAddress = [
    address?.house,

    address?.area,

    address?.address,

    address?.city,

    address?.district,

    address?.state,
  ]
    .filter(Boolean)
    .join(", ");

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="payment-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div className="payment-sidebar">

        <div
          className={`payment-item ${
            selectedMethod ===
            "razorpay"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSelectedMethod(
              "razorpay",
            )
          }
        >
          <FaGooglePay />

          <span>
            UPI / Card / Net Banking
          </span>
        </div>

        <div
          className={`payment-item ${
            selectedMethod ===
            "card"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSelectedMethod(
              "card",
            )
          }
        >
          <FaCreditCard />

          <span>
            Card
          </span>
        </div>

        <div
          className={`payment-item ${
            selectedMethod ===
            "cod"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSelectedMethod(
              "cod",
            )
          }
        >
          <FaMoneyBillWave />

          <span>
            Cash On Delivery
          </span>
        </div>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="payment-content">

        {selectedMethod ===
          "razorpay" && (
          <div className="payment-box">

            <h2>
              Secure Payment
            </h2>

            <p>
              Pay securely using:
            </p>

            <ul>
              <li>
                UPI
              </li>

              <li>
                Credit / Debit Card
              </li>

              <li>
                Net Banking
              </li>

              <li>
                Wallets
              </li>
            </ul>

            <div className="secure-box">

              <FaLock />

              <span>
                Secured by Razorpay
              </span>

            </div>

          </div>
        )}

        {selectedMethod ===
          "card" && (
          <div className="payment-box">

            <h2>
              Card Payment
            </h2>

            <p>
              Card payment will open
              in Razorpay secure
              checkout.
            </p>

            <div className="secure-box">

              <FaLock />

              <span>
                Your card details are
                securely handled by
                Razorpay.
              </span>

            </div>

          </div>
        )}

        {selectedMethod ===
          "cod" && (
          <div className="payment-box">

            <h2>
              Cash On Delivery
            </h2>

            <p>
              Pay when your product
              is delivered.
            </p>

          </div>
        )}

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="payment-summary">

        <h3>
          PRICE DETAILS
        </h3>

        <p>
          Product :{" "}
          {product?.title ||
            "Product Purchase"}
        </p>

        <p>
          Quantity :{" "}
          {quantity}
        </p>

        <p>
          Amount : ₹
          {totalAmount.toLocaleString(
            "en-IN",
          )}
        </p>

        {/* ADDRESS */}

        <div className="address-box">

          <h4>
            Deliver To
          </h4>

          {address ? (
            <>
              <p>
                <strong>
                  {address.name}
                </strong>{" "}

                {(
                  address.addressType ||
                  address.type
                ) && (
                  <>
                    (
                    {address.addressType ||
                      address.type}
                    )
                  </>
                )}
              </p>

              <p>
                {fullAddress}
              </p>

              {address.pincode && (
                <p>
                  PIN:{" "}
                  {address.pincode}
                </p>
              )}

              {address.landmark && (
                <p>
                  Landmark:{" "}
                  {address.landmark}
                </p>
              )}

              <p>
                Mobile:{" "}
                {address.mobile}
              </p>
            </>
          ) : (
            <p>
              No Address
            </p>
          )}

        </div>

        {/* SECURITY */}

        <div className="secure-box">

          <FaLock />

          <p>
            Safe & Secure Payment
          </p>

        </div>

        {/* BUTTON */}

        <button
          className="confirm-payment-btn"
          disabled={loading}
          onClick={
            handlePayment
          }
        >
          {loading
            ? "Processing..."
            : selectedMethod ===
                "cod"
              ? `PLACE ORDER ₹${totalAmount.toLocaleString(
                  "en-IN",
                )}`
              : `PAY ₹${totalAmount.toLocaleString(
                  "en-IN",
                )}`}
        </button>

      </div>

    </div>
  );
};

export default Payment;