import "./OrderSummary.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiX,
  FiPlus,
  FiMoreHorizontal,
  FiHome,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiChevronDown,
  FiShield,
  FiInfo,
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
// USER
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
// HELPERS
// =====================================================

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getAddressId = (item) => item?._id || item?.id || null;

const getAddressType = (item) =>
  (item?.addressType || item?.type || "Home").toUpperCase();

const getFullAddress = (item) => {
  if (!item) return "";

  const parts = [];

  if (item.house) parts.push(item.house);
  if (item.area) parts.push(item.area);
  if (item.address && typeof item.address === "string") {
    parts.push(item.address);
  }
  if (item.city) parts.push(item.city);
  if (item.district) parts.push(item.district);
  if (item.state) parts.push(item.state);

  let result = parts.join(", ");

  if (item.pincode) {
    result += result ? ` - ${item.pincode}` : item.pincode;
  }

  return result;
};

// =====================================================
// ORDER SUMMARY
// =====================================================

function OrderSummary() {
  const navigate = useNavigate();

  const [product] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("buyProduct") || "null");
    } catch (error) {
      console.error("BUY PRODUCT PARSE ERROR:", error);
      return null;
    }
  });

  const [quantity, setQuantity] = useState(1);
  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);

  // Address
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Drawer
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [menuAddressId, setMenuAddressId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ===================================================
  // LOAD ADDRESSES
  // ===================================================

  const loadAddresses = async () => {
    const userId = getUserId();

    if (!userId) {
      setSavedAddresses([]);
      setAddress(null);
      return;
    }

    try {
      setAddressLoading(true);
      setAddressError("");

      const response = await API.get(`/addresses/user/${userId}`);

      let addresses = [];

      if (Array.isArray(response.data?.addresses)) {
        addresses = response.data.addresses;
      } else if (Array.isArray(response.data)) {
        addresses = response.data;
      } else if (Array.isArray(response.data?.data)) {
        addresses = response.data.data;
      }

      setSavedAddresses(addresses);

      const selectedId = localStorage.getItem("selectedAddressId");

      let selectedAddress = null;

      if (selectedId) {
        selectedAddress =
          addresses.find(
            (item) => String(getAddressId(item)) === String(selectedId),
          ) || null;
      }

      if (!selectedAddress) {
        selectedAddress =
          addresses.find((item) => item.isDefault === true) || null;
      }

      if (!selectedAddress && addresses.length > 0) {
        selectedAddress = addresses[0];
      }

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
      } else {
        setAddress(null);
        localStorage.removeItem("selectedAddress");
        localStorage.removeItem("selectedAddressId");
      }
    } catch (error) {
      console.error("LOAD ADDRESS ERROR:", error);
      console.error("SERVER RESPONSE:", error.response?.data);
      setAddressError("Address load nahi ho saka.");
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();

    const handleAddressChanged = () => loadAddresses();

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
  // ADDRESS ACTIONS
  // ===================================================

  const changeAddress = async () => {
    setMenuAddressId(null);
    await loadAddresses();
    setShowAddressDrawer(true);
  };

  const selectAddress = (selectedAddress) => {
    if (!selectedAddress) return;

    const id = getAddressId(selectedAddress);

    setAddress(selectedAddress);
    localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));

    if (id) {
      localStorage.setItem("selectedAddressId", String(id));
    }

    setShowAddressDrawer(false);
    setMenuAddressId(null);

    window.dispatchEvent(new Event("addressChanged"));
  };

  const addNewAddress = () => {
    setShowAddressDrawer(false);
    setMenuAddressId(null);

    localStorage.removeItem("editingAddressId");
    localStorage.removeItem("editingAddress");

    navigate("/booking-address");
  };

  const editAddress = (item) => {
    const id = getAddressId(item);

    if (!id) {
      alert("Address ID not found.");
      return;
    }

    localStorage.setItem("editingAddressId", String(id));
    localStorage.setItem("editingAddress", JSON.stringify(item));

    setMenuAddressId(null);
    setShowAddressDrawer(false);

    navigate("/booking-address");
  };

  const deleteAddress = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await API.delete(`/addresses/${id}`);

      const updated = savedAddresses.filter(
        (item) => String(getAddressId(item)) !== String(id),
      );

      setSavedAddresses(updated);

      const currentId = address ? getAddressId(address) : null;

      if (currentId && String(currentId) === String(id)) {
        const nextAddress = updated[0] || null;

        setAddress(nextAddress);

        if (nextAddress) {
          localStorage.setItem("selectedAddress", JSON.stringify(nextAddress));
          localStorage.setItem(
            "selectedAddressId",
            String(getAddressId(nextAddress)),
          );
        } else {
          localStorage.removeItem("selectedAddress");
          localStorage.removeItem("selectedAddressId");
        }
      }

      setMenuAddressId(null);
      window.dispatchEvent(new Event("addressChanged"));

      alert("Address deleted successfully.");
    } catch (error) {
      console.error("DELETE ADDRESS ERROR:", error);
      alert(error.response?.data?.message || "Address delete nahi ho saka.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===================================================
  // PRODUCT
  // ===================================================

  if (!product) {
    return (
      <div className="product-not-found">
        <h3>Product Not Found</h3>
        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    );
  }

  const price = Number(product.price) || 0;

  const originalPrice =
    Number(product.originalPrice) > price
      ? Number(product.originalPrice)
      : price;

  const productImage =
    product.selectedColorImage ||
    product.image ||
    product.images?.[0] ||
    "https://via.placeholder.com/180";

  const variantText =
    product.selectedVariant?.name ||
    product.selectedVariant?.ram ||
    product.selectedVariant?.rom ||
    product.variant ||
    product.size ||
    "";

  const colorText = product.selectedColor || product.color || "";

  const rating = product.rating || "4.3";
  const reviews = product.reviews || product.reviewCount || "35,795";

  // ===================================================
  // PRICE
  // Flipkart-style: selling price + fee
  // ===================================================

  const totalProductPrice = price * quantity;
  const totalMRP = originalPrice * quantity;

  const discount = Math.max(totalMRP - totalProductPrice, 0);

  const platformFee = 9;
  const deliveryCharge = 0;
  const totalAmount = totalProductPrice + platformFee + deliveryCharge;

  const savings = discount;

  // ===================================================
  // DELIVERY DATE
  // ===================================================

  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5);

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, []);

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
        originalPrice: totalMRP,
        discount,
        platformFee,
        deliveryCharge,
        deliveryDate,
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

      <div className="order-layout">
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="order-left">
          {/* ADDRESS */}
          <section className="delivery-box">
            {address ? (
              <div className="delivery-top">
                <div className="delivery-content">
                  <p className="deliver-title">Deliver to:</p>

                  <div className="customer-name">
                    <b>{address.name}</b>
                    <span>{getAddressType(address)}</span>
                  </div>

                  <p className="address-text">{getFullAddress(address)}</p>

                  {address.landmark && (
                    <p className="address-text">Landmark: {address.landmark}</p>
                  )}

                  {address.mobile && (
                    <p className="mobile-text">{address.mobile}</p>
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
            ) : (
              <div className="delivery-top">
                <div>
                  <p className="deliver-title">Deliver to:</p>

                  <p className="no-address-text">
                    {addressLoading
                      ? "Loading address..."
                      : "No delivery address selected"}
                  </p>
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
          </section>

          {/* PRODUCT */}
          <section className="product-card">
            <div className="product-main">
              <div className="product-image-column">
                <div className="product-image-box">
                  <img src={productImage} alt={product.title} />
                </div>

                <div className="qty-border-wrapper">
                  <div
                    className="qty-display"
                    onClick={() => setShowQuantityDropdown((prev) => !prev)}
                  >
                    <span>Qty: {quantity}</span>
                    <span className="qty-arrow">▼</span>
                  </div>

                  {showQuantityDropdown && (
                    <div className="qty-options">
                      {/* 1 */}
                      <div
                        className="qty-option"
                        onClick={() => {
                          setQuantity(1);
                          setShowQuantityDropdown(false);
                        }}
                      >
                        1
                      </div>

                      {/* 2 */}
                      <div
                        className="qty-option"
                        onClick={() => {
                          setQuantity(2);
                          setShowQuantityDropdown(false);
                        }}
                      >
                        2
                      </div>

                      {/* 3 */}
                      <div
                        className="qty-option"
                        onClick={() => {
                          setQuantity(3);
                          setShowQuantityDropdown(false);
                        }}
                      >
                        3
                      </div>

                      {/* MORE */}
                      <div
                        className="qty-option qty-more"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>More</span>

                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => {
                            const value = e.target.value;

                            if (value === "") {
                              setQuantity("");
                              return;
                            }

                            setQuantity(Number(value));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (Number(quantity) > 0) {
                                setShowQuantityDropdown(false);
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="product-infos">
                <h3>{product.title}</h3>

                {variantText && (
                  <p className="product-variant">{variantText}</p>
                )}

                {colorText && (
                  <p className="product-color">Color: {colorText}</p>
                )}

                <div className="rating-row">
                  <span className="rating-stars">
                    ★★★★<i>★</i>
                  </span>

                  <b>{rating}</b>

                  <span className="review-count">({reviews})</span>

                  <span className="assured">✓ Assured</span>
                </div>

                <div className="product-price">
                  <span className="discount">
                    ↓{Math.round((discount / totalMRP) * 100) || 0}%
                  </span>

                  <del>{money(originalPrice)}</del>

                  <strong>{money(price)}</strong>
                </div>

                <p className="protect-fee">
                  + ₹{platformFee} Protect Promise Fee
                  <FiInfo />
                </p>

                <p className="delivery-date">
                  Delivery by <b>{deliveryDate}</b>
                </p>
              </div>
            </div>

            <div className="product-bottom">
              <button type="button">
                <span>♧</span>
                Save for later
              </button>

              <button type="button">
                <FiTrash2 />
                Remove
              </button>

              <button type="button" onClick={handlePayment}>
                ⚡ Buy this now
              </button>
            </div>
          </section>

          {/* OPEN BOX */}
          <div className="open-box">
            <FiShield />
            <div>
              <b>Safe and secure payments</b>
              <span>Easy returns. 100% Authentic products.</span>
            </div>
          </div>

          <p className="terms-text">
            By continuing with the order, you confirm that you are above 18
            years of age and you agree to the ApnaBazar's{" "}
            <a href="#terms">Terms of Use</a> and{" "}
            <a href="#privacy">Privacy Policy</a>
          </p>
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <aside className="order-right">
          <div className="price-box">
            <h3>Price Details</h3>

            <div className="price-row">
              <span>MRP (incl. of all taxes)</span>
              <span>{money(totalMRP)}</span>
            </div>

            <div className="price-row">
              <span className="fees-label">
                Fees <FiChevronDown />
              </span>
              <span>{money(platformFee)}</span>
            </div>

            <div className="price-row discount-row">
              <span className="discount-label-text">
                Discounts <FiChevronDown />
              </span>
              <span>{money(discount)}</span>
            </div>

            <hr />

            <div className="total-row">
              <span>Total Amount</span>
              <strong>{money(totalAmount)}</strong>
            </div>

            <div className="saving-box">
              <span>♣</span>
              You'll save <b>{money(savings)}</b> on this order!
            </div>
          </div>

          <div className="secure-box">
            <FiShield />

            <div>
              <b>Safe and secure payments</b>
              <span>Easy returns. 100% Authentic products.</span>
            </div>
          </div>

          <div className="continue-box">
            <div className="bottom-total">
              <del>{money(totalMRP)}</del>
              <strong>{money(totalAmount)}</strong>
            </div>

            <button type="button" onClick={handlePayment}>
              Continue
            </button>
          </div>
        </aside>
      </div>

      {/* =====================================================
          ADDRESS DRAWER
      ===================================================== */}

      {showAddressDrawer && (
        <>
          <div
            className="address-overlay"
            onClick={() => setShowAddressDrawer(false)}
          />

          <div className="address-drawer">
            <div className="drawer-top-line"></div>

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
                        <div className="address-icon">
                          <FiHome />
                        </div>

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

                        {menuAddressId === itemId && (
                          <div
                            className="address-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => editAddress(item)}
                            >
                              <FiEdit2 />
                              Edit
                            </button>

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
