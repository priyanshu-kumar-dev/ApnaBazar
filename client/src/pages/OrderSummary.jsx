import "./OrderSummary.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiX,
  FiPlus,
  FiMoreHorizontal,
  FiHome,
  FiEdit2,
  FiTrash2,
  FiMapPin,
} from "react-icons/fi";

import axios from "axios";

// =====================================================
// API
// =====================================================

const API = axios.create({
  baseURL: "https://apnabazar-6zxf.onrender.com/api",
  withCredentials: true,
});

// =====================================================
// GET LOGGED IN USER ID
// =====================================================

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return user?._id || user?.id || user?.userId || null;
  } catch (error) {
    console.error("USER PARSE ERROR:", error);
    return null;
  }
};

// =====================================================
// ORDER SUMMARY
// =====================================================

function OrderSummary() {
  const navigate = useNavigate();

  // ===================================================
  // PRODUCT
  // ===================================================

  let product = null;

  try {
    product = JSON.parse(localStorage.getItem("buyProduct") || "null");
  } catch (error) {
    console.error("BUY PRODUCT PARSE ERROR:", error);
    product = null;
  }

  const [quantity, setQuantity] = useState(1);

  // ===================================================
  // ADDRESS STATE
  // ===================================================

  const [savedAddresses, setSavedAddresses] = useState([]);

  const [address, setAddress] = useState(null);

  const [addressLoading, setAddressLoading] = useState(false);

  const [addressError, setAddressError] = useState("");

  // ===================================================
  // DRAWER
  // ===================================================

  const [showAddressDrawer, setShowAddressDrawer] = useState(false);

  const [menuAddressId, setMenuAddressId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // ===================================================
  // GET ADDRESS ID
  // ===================================================

  const getAddressId = (item) => {
    if (!item) return null;

    return item._id || item.id || null;
  };

  // ===================================================
  // GET ADDRESS TYPE
  // ===================================================

  const getAddressType = (item) => {
    if (!item) {
      return "HOME";
    }

    return (item.addressType || item.type || "Home").toUpperCase();
  };

  // ===================================================
  // GET FULL ADDRESS
  // ===================================================

  const getFullAddress = (item = address) => {
    if (!item) {
      return "";
    }

    const parts = [];

    if (item.house) {
      parts.push(item.house);
    }

    if (item.area) {
      parts.push(item.area);
    }

    // Old address field support
    if (item.address && typeof item.address === "string") {
      parts.push(item.address);
    }

    if (item.city) {
      parts.push(item.city);
    }

    if (item.district) {
      parts.push(item.district);
    }

    if (item.state) {
      parts.push(item.state);
    }

    let result = parts.join(", ");

    if (item.pincode) {
      result += ` - ${item.pincode}`;
    }

    return result;
  };

  // ===================================================
  // LOAD ADDRESSES FROM MONGODB
  // ===================================================

  const loadAddresses = async () => {
    const userId = getUserId();

    if (!userId) {
      console.log("No logged in user found.");

      setSavedAddresses([]);
      setAddress(null);

      return;
    }

    try {
      setAddressLoading(true);
      setAddressError("");

      console.log("Loading addresses for user:", userId);

      // IMPORTANT:
      // server.js:
      // app.use("/api/addresses", addressRoutes)

      const response = await API.get(`/addresses/user/${userId}`);

      console.log("ADDRESS API RESPONSE:", response.data);

      let addresses = [];

      if (Array.isArray(response.data?.addresses)) {
        addresses = response.data.addresses;
      } else if (Array.isArray(response.data)) {
        addresses = response.data;
      } else if (Array.isArray(response.data?.data)) {
        addresses = response.data.data;
      }

      console.log("MONGODB ADDRESSES:", addresses);

      setSavedAddresses(addresses);

      // =================================================
      // FIND CURRENT SELECTED ADDRESS
      // =================================================

      const selectedId = localStorage.getItem("selectedAddressId");

      let selectedAddress = null;

      // -------------------------------------------------
      // 1. Previously selected address
      // -------------------------------------------------

      if (selectedId) {
        selectedAddress =
          addresses.find(
            (item) => String(getAddressId(item)) === String(selectedId),
          ) || null;
      }

      // -------------------------------------------------
      // 2. If selected address doesn't exist,
      //    find default address
      // -------------------------------------------------

      if (!selectedAddress) {
        selectedAddress =
          addresses.find((item) => item.isDefault === true) || null;
      }

      // -------------------------------------------------
      // 3. If no default, use first MongoDB address
      // -------------------------------------------------

      if (!selectedAddress && addresses.length > 0) {
        selectedAddress = addresses[0];
      }

      // =================================================
      // SAVE SELECTED ADDRESS
      // =================================================

      if (selectedAddress) {
        const id = getAddressId(selectedAddress);

        setAddress(selectedAddress);

        localStorage.setItem(
          "selectedAddress",
          JSON.stringify(selectedAddress),
        );

        if (id) {
          localStorage.setItem("selectedAddressId", String(id));
        }

        console.log("DELIVERY BOX ADDRESS:", selectedAddress);
      } else {
        setAddress(null);

        localStorage.removeItem("selectedAddress");

        localStorage.removeItem("selectedAddressId");

        console.log("No address found in MongoDB");
      }
    } catch (error) {
      console.error("LOAD ADDRESS ERROR:", error);

      console.error("SERVER RESPONSE:", error.response?.data);

      setAddressError("Address load nahi ho saka.");
    } finally {
      setAddressLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadAddresses();

    const handleAddressChanged = () => {
      loadAddresses();
    };

    window.addEventListener("addressChanged", handleAddressChanged);

    window.addEventListener("focus", handleAddressChanged);

    window.addEventListener("storage", handleAddressChanged);

    return () => {
      window.removeEventListener("addressChanged", handleAddressChanged);

      window.removeEventListener("focus", handleAddressChanged);

      window.removeEventListener("storage", handleAddressChanged);
    };
  }, []);

  // ===================================================
  // CHANGE ADDRESS
  // ===================================================

  const changeAddress = async () => {
    setMenuAddressId(null);

    await loadAddresses();

    setShowAddressDrawer(true);
  };

  // ===================================================
  // SELECT ADDRESS
  // ===================================================

  const selectAddress = (selectedAddress) => {
    if (!selectedAddress) {
      return;
    }

    const id = getAddressId(selectedAddress);

    // Update delivery box immediately
    setAddress(selectedAddress);

    // Save selected address
    localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));

    if (id) {
      localStorage.setItem("selectedAddressId", String(id));
    }

    // Close drawer
    setShowAddressDrawer(false);

    setMenuAddressId(null);

    // Tell other components
    window.dispatchEvent(new Event("addressChanged"));

    console.log("SELECTED DELIVERY ADDRESS:", selectedAddress);
  };

  // ===================================================
  // ADD NEW ADDRESS
  // ===================================================

  const addNewAddress = () => {
    setShowAddressDrawer(false);

    setMenuAddressId(null);

    // New address mode
    localStorage.removeItem("editingAddressId");

    localStorage.removeItem("editingAddress");

    navigate("/booking-address");
  };

  // ===================================================
  // EDIT ADDRESS
  // ===================================================

  const editAddress = (item) => {
    if (!item) {
      return;
    }

    const id = getAddressId(item);

    if (!id) {
      alert("Address ID not found.");
      return;
    }

    console.log("EDITING ADDRESS:", item);

    localStorage.setItem("editingAddressId", String(id));

    localStorage.setItem("editingAddress", JSON.stringify(item));

    setMenuAddressId(null);

    setShowAddressDrawer(false);

    navigate("/booking-address");
  };

  // ===================================================
  // DELETE ADDRESS
  // ===================================================

  const deleteAddress = async (id) => {
    if (!id) {
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(id);

      console.log("Deleting address:", id);

      // IMPORTANT:
      // /api/addresses/:id

      const response = await API.delete(`/addresses/${id}`);

      console.log("DELETE ADDRESS RESPONSE:", response.data);

      // Remove from frontend
      const updatedAddresses = savedAddresses.filter(
        (item) => String(getAddressId(item)) !== String(id),
      );

      setSavedAddresses(updatedAddresses);

      // Check if currently selected
      const currentId = address ? getAddressId(address) : null;

      if (currentId && String(currentId) === String(id)) {
        setAddress(null);

        localStorage.removeItem("selectedAddress");

        localStorage.removeItem("selectedAddressId");

        // If another address exists,
        // don't automatically select it.
      }

      setMenuAddressId(null);

      window.dispatchEvent(new Event("addressChanged"));

      alert("Address deleted successfully.");
    } catch (error) {
      console.error("DELETE ADDRESS ERROR:", error);

      console.error("SERVER RESPONSE:", error.response?.data);

      alert(error.response?.data?.message || "Address delete nahi ho saka.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===================================================
  // PRODUCT NOT FOUND
  // ===================================================

  if (!product) {
    return <div className="product-not-found">Product Not Found</div>;
  }

  // ===================================================
  // PRICE
  // ===================================================

  const price = Number(product.price) || 0;

  const totalProductPrice = price * quantity;

  const discount = Math.round(totalProductPrice * 0.1);

  const gst = Math.round(totalProductPrice * 0.18);

  const openBoxDelivery = 0;

  const platformFee = 0;

  const deliveryCharge = 0;

  const totalAmount =
    totalProductPrice -
    discount +
    gst +
    openBoxDelivery +
    platformFee +
    deliveryCharge;

  const originalPrice = Number(product.originalPrice) || 33999;

  // ===================================================
  // DELIVERY DATE
  // ===================================================

  const deliveryDate = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000,
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });

  // ===================================================
  // PAYMENT
  // ===================================================

  const handlePayment = () => {
    if (!address) {
      alert("Please select a delivery address");

      setShowAddressDrawer(true);

      return;
    }

    localStorage.setItem(
      "orderSummary",
      JSON.stringify({
        product,
        quantity,
        address,
        totalAmount,
      }),
    );

    navigate("/payment");
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="order-page">
      {/* =================================================
          CHECKOUT STEPS
      ================================================= */}

      <div className="checkout-steps">
        <div className="step completed">
          <div className="step-circle">✓</div>

          <span>Address</span>
        </div>

        <div className="step-line active"></div>

        <div className="step active-step">
          <div className="step-circle">2</div>

          <span>Order Summary</span>
        </div>

        <div className="step-line"></div>

        <div className="step">
          <div className="step-circle">3</div>

          <span>Payment</span>
        </div>
      </div>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="order-layout">
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="order-left">
          {/* =================================================
              DELIVERY ADDRESS
          ================================================= */}

          <div className="delivery-box">
            {address ? (
              <div className="delivery-top">
                <div>
                  <p className="deliver-title">Deliver to:</p>

                  <div className="customer-name">
                    <b>{address.name}</b>

                    <span>{getAddressType(address)}</span>
                  </div>

                  <p className="address-text">{getFullAddress(address)}</p>

                  {address.landmark && (
                    <p className="address-text">Landmark: {address.landmark}</p>
                  )}

                  <p className="mobile-text">{address.mobile}</p>
                </div>

                <button
                  type="button"
                  className="change-btn"
                  onClick={changeAddress}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="delivery-top">
                <div>
                  <p className="deliver-title">Deliver to:</p>

                  {addressLoading ? (
                    <p className="no-address-text">Loading address...</p>
                  ) : (
                    <p className="no-address-text">
                      No delivery address selected
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="change-btn"
                  onClick={changeAddress}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              PRODUCT
          ================================================= */}

          <div className="product-card">
            <div className="discount-label">Top Discount of the Sale</div>

            <div className="product-main">
              <div className="product-image-box">
                <img src={product.image} alt={product.title} />
              </div>

              <div className="product-infos">
                <h3>{product.title}</h3>

                <p className="order-rating">
                  ★★★★
                  <span>★</span>
                  <b> 4.3</b>
                  <em> | 35795</em>
                </p>

                <div className="product-price">
                  <span className="discount">↓10%</span>

                  <del>₹{originalPrice.toLocaleString("en-IN")}</del>

                  <strong>₹{price.toLocaleString("en-IN")}</strong>
                </div>

                <p className="protect-fee">+ ₹109 Protect Promise Fee</p>
              </div>

              <div className="quantity-box">
                <span>Qty:</span>

                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {Array.from(
                    {
                      length: 10,
                    },
                    (_, i) => i + 1,
                  ).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="delivery-date">
              Delivery by <b>{deliveryDate}</b>
            </p>

            <label className="gst-check">
              <input type="checkbox" />

              <span>Use GST Invoice</span>
            </label>
          </div>

          {/* =================================================
              OPEN BOX
          ================================================= */}

          <div className="open-box">
            <span className="open-box-icon">📦</span>

            <span>Rest assured with Open Box Delivery</span>
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="order-right">
          <div className="price-box">
            <h3>Price Details</h3>

            <div className="price-row">
              <span>MRP (incl. of all taxes)</span>

              <span>₹{originalPrice.toLocaleString("en-IN")}</span>
            </div>

            <div className="price-row">
              <span>Fees⌄</span>

              <span>₹{openBoxDelivery + platformFee}</span>
            </div>

            <div className="price-row discount-row">
              <span>Discounts⌄</span>

              <span>₹{discount.toLocaleString("en-IN")}</span>
            </div>

            <hr />

            <div className="total-row">
              <span>Total Amount</span>

              <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
            </div>

            <div className="saving-box">
              🎁 You'll save ₹{discount.toLocaleString("en-IN")} on this order!
            </div>
          </div>

          <div className="continue-box">
            <div>
              <del>₹{originalPrice.toLocaleString("en-IN")}</del>

              <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
            </div>

            <button type="button" onClick={handlePayment}>
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          ADDRESS DRAWER
      ===================================================== */}

      {showAddressDrawer && (
        <>
          {/* OVERLAY */}

          <div
            className="address-overlay"
            onClick={() => setShowAddressDrawer(false)}
          />

          {/* DRAWER */}

          <div className="address-drawer">
            <div className="drawer-top-line"></div>

            {/* HEADER */}

            <div className="drawer-header">
              <h2>Select delivery address</h2>

              <button
                type="button"
                className="drawer-close"
                onClick={() => setShowAddressDrawer(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="drawer-divider"></div>

            {/* SAVED HEADER */}

            <div className="saved-header">
              <h3>Saved addresses</h3>

              <button
                type="button"
                className="add-new-btn"
                onClick={addNewAddress}
              >
                <FiPlus />
                Add New
              </button>
            </div>

            {/* LOADING */}

            {addressLoading ? (
              <div className="empty-address">
                <FiMapPin />

                <p>Loading addresses...</p>
              </div>
            ) : addressError ? (
              <div className="empty-address">
                <FiMapPin />

                <p>{addressError}</p>

                <button type="button" onClick={loadAddresses}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="address-list">
                {savedAddresses.length === 0 ? (
                  <div className="empty-address">
                    <FiHome />

                    <p>No saved address</p>

                    <button type="button" onClick={addNewAddress}>
                      Add New Address
                    </button>
                  </div>
                ) : (
                  savedAddresses.map((item) => {
                    const itemId = getAddressId(item);

                    const selected =
                      address &&
                      String(getAddressId(address)) === String(itemId);

                    return (
                      <div
                        className={`saved-address ${
                          selected ? "selected-address" : ""
                        }`}
                        key={itemId}
                        onClick={() => selectAddress(item)}
                      >
                        {/* ADDRESS ICON */}

                        <div className="address-icon">
                          <FiHome />
                        </div>

                        {/* ADDRESS CONTENT */}

                        <div className="address-content">
                          <div className="address-name-row">
                            <b>{item.name}</b>

                            {selected && (
                              <span className="selected-badge">Selected</span>
                            )}

                            <span className="home-badge">
                              {getAddressType(item)}
                            </span>
                          </div>

                          <p>{getFullAddress(item)}</p>

                          {item.landmark && <p>Landmark: {item.landmark}</p>}

                          <p className="drawer-mobile">{item.mobile}</p>
                        </div>

                        {/* THREE DOT */}

                        <button
                          type="button"
                          className="more-address-btn"
                          onClick={(e) => {
                            e.stopPropagation();

                            setMenuAddressId(
                              menuAddressId === itemId ? null : itemId,
                            );
                          }}
                        >
                          <FiMoreHorizontal />
                        </button>

                        {/* MENU */}

                        {menuAddressId === itemId && (
                          <div
                            className="address-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() => editAddress(item)}
                            >
                              <FiEdit2 />
                              Edit
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              className="delete-menu-btn"
                              disabled={deletingId === itemId}
                              onClick={() => deleteAddress(itemId)}
                            >
                              <FiTrash2 />

                              {deletingId === itemId ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default OrderSummary;
