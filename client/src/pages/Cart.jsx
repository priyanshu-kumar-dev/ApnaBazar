import "./Cart.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();

  // ==========================================
  // CART
  // ==========================================

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  // ==========================================
  // ADDRESS
  // ==========================================

  const [address] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("deliveryAddress")) || {
          name: "Priyanshu Kumar",
          pincode: "302022",
          type: "HOME",
          address:
            "Jagannath University YIT, Jaipur Sitapura Jagannath University YIT campus gate no 2, Jaipur",
        }
      );
    } catch {
      return {
        name: "Priyanshu Kumar",
        pincode: "302022",
        type: "HOME",
        address:
          "Jagannath University YIT, Jaipur Sitapura Jagannath University YIT campus gate no 2, Jaipur",
      };
    }
  });

  // ==========================================
  // SAVE CART
  // ==========================================

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ==========================================
  // ITEM KEY
  // ==========================================

  const getItemKey = (item) => {
    return `${item.id || ""}-${
      item.selectedColor || ""
    }-${item.selectedSize || ""}-${item.cartVariantKey || ""}`;
  };

  // ==========================================
  // REMOVE CART ITEM
  // ==========================================

  const removeCart = (item) => {
    const key = getItemKey(item);

    const updatedCart = cart.filter((cartItem) => getItemKey(cartItem) !== key);

    setCart(updatedCart);
  };

  // ==========================================
  // SAVE FOR LATER
  // ==========================================

  const saveForLater = (item) => {
    try {
      const savedItems = JSON.parse(localStorage.getItem("savedCart")) || [];

      const key = getItemKey(item);

      const alreadySaved = savedItems.some(
        (savedItem) => getItemKey(savedItem) === key,
      );

      if (!alreadySaved) {
        localStorage.setItem(
          "savedCart",
          JSON.stringify([...savedItems, item]),
        );
      }

      removeCart(item);
    } catch (error) {
      console.error("SAVE FOR LATER ERROR:", error);
    }
  };

  // ==========================================
  // QUANTITY
  // ==========================================

  const updateQuantity = (item, quantity) => {
    const newQuantity = Math.max(1, Number(quantity));

    const itemKey = getItemKey(item);

    const updatedCart = cart.map((cartItem) => {
      if (getItemKey(cartItem) === itemKey) {
        return {
          ...cartItem,
          quantity: newQuantity,
        };
      }

      return cartItem;
    });

    setCart(updatedCart);
  };

  // ==========================================
  // BUY THIS NOW
  // ==========================================

  const buyNow = (item) => {
    localStorage.setItem("buyNowItem", JSON.stringify(item));

    navigate("/booking-address");
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = () => {
    if (!cart.length) return;

    localStorage.setItem(
      "buyNowItem",
      JSON.stringify({
        ...cart[0],
        cartItems: cart,
      }),
    );

    navigate("/booking-address");
  };

  // ==========================================
  // CHANGE ADDRESS
  // ==========================================

  const changeAddress = () => {
    navigate("/booking-address");
  };

  // ==========================================
  // DELIVERY DATE
  // ==========================================

  const getDeliveryDate = (item) => {
    if (item.deliveryDate) {
      return item.deliveryDate;
    }

    const date = new Date();

    date.setDate(date.getDate() + Number(item.deliveryDays || 3));

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  // ==========================================
  // PRICE CALCULATION
  // ==========================================

  const priceData = cart.reduce(
    (acc, item) => {
      const quantity = Number(item.quantity) || 1;

      const price = Number(item.price) || 0;

      const originalPrice =
        Number(item.originalPrice) ||
        Math.round(price / (1 - (Number(item.discount) || 25) / 100));

      acc.totalItems += quantity;

      acc.totalPrice += price * quantity;

      acc.originalPrice += originalPrice * quantity;

      return acc;
    },
    {
      totalItems: 0,
      totalPrice: 0,
      originalPrice: 0,
    },
  );

  const totalDiscount = Math.max(
    0,
    priceData.originalPrice - priceData.totalPrice,
  );

  const deliveryFee = priceData.totalPrice >= 499 ? 0 : 40;

  const protectFee = cart.length * 109;

  const finalAmount = priceData.totalPrice + deliveryFee + protectFee;

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (cart.length === 0) {
    return (
      <div className="flipkart-cart-page">
        <div className="empty-cart-page">
          <div className="empty-cart-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p>Add items to your cart and they will appear here.</p>

          <button className="shop-now-btn" onClick={() => navigate("/")}>
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="flipkart-cart-page">
      {/* =====================================
          MAIN LAYOUT
      ====================================== */}

      <div className="cart-layout">
        {/* ===================================
            LEFT SIDE
        ==================================== */}

        <div className="cart-left">
          {/* ================================
              DELIVERY ADDRESS
          ================================= */}

          <div className="delivery-box">
            <div className="delivery-left">
              <div className="deliver-title">
                <span className="deliver-label">Deliver to:</span>

                <strong>
                  {address.name}, {address.pincode}
                </strong>

                <span className="home-badge">{address.type || "HOME"}</span>
              </div>

              <div className="delivery-address">{address.address}</div>
            </div>

            <button className="change-address-btn" onClick={changeAddress}>
              Change
            </button>
          </div>

          {/* ================================
              CART HEADER
          ================================= */}

          <div className="cart-heading">
            <h1>My Cart</h1>

            <span>
              {priceData.totalItems}{" "}
              {priceData.totalItems === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* ================================
              CART ITEMS
          ================================= */}

          <div className="cart-list">
            {cart.map((item) => {
              const quantity = Number(item.quantity) || 1;

              const price = Number(item.price) || 0;

              const originalPrice =
                Number(item.originalPrice) ||
                Math.round(price / (1 - (Number(item.discount) || 25) / 100));

              const discount =
                Number(item.discount) ||
                Math.round(((originalPrice - price) / originalPrice) * 100);

              const totalPrice = price * quantity;

              return (
                <div className="cart-card" key={getItemKey(item)}>
                  {/* ==========================
                      PRODUCT
                  =========================== */}

                  <div className="product-main">
                    {/* IMAGE + QTY */}

                    <div className="cart-image-section">
                      <div className="cart-image">
                        <img
                          src={
                            item.image ||
                            item.selectedColorImage ||
                            item.images?.[0] ||
                            "https://via.placeholder.com/150"
                          }
                          alt={item.title || "Product"}
                        />
                      </div>

                      {/* QUANTITY */}

                      <div className="quantity-box">
                        <span>Qty:</span>

                        <select
                          value={quantity}
                          onChange={(e) => updateQuantity(item, e.target.value)}
                        >
                          {Array.from(
                            {
                              length: 10,
                            },
                            (_, i) => i + 1,
                          ).map((number) => (
                            <option key={number} value={number}>
                              {number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="cart-details">
                      <h2 className="product-title">
                        {item.title || "Product"}
                      </h2>

                      {/* COLOR */}

                      {item.selectedColor && (
                        <p className="variant-text">
                          Color: {item.selectedColor}
                        </p>
                      )}

                      {/* VARIANT */}

                      {(item.ram ||
                        item.rom ||
                        item.variant ||
                        item.cartVariantKey) && (
                        <p className="variant-text">
                          {item.ram && `${item.ram} RAM`}

                          {item.rom && ` | ${item.rom}`}

                          {item.variant && ` | ${item.variant}`}
                        </p>
                      )}

                      {/* SIZE */}

                      {item.selectedSize && (
                        <p className="variant-text">
                          Size: {item.selectedSize}
                        </p>
                      )}

                      {/* RATING */}

                      <div className="rating-row">
                        <span className="rating-box">
                          {item.rating || "4.2"} ★
                        </span>

                        <span className="reviews">
                          {item.reviews || item.ratingCount || "4,992"} Ratings
                          & Reviews
                        </span>

                        <span className="assured">
                          <span className="assured-shield">✓</span>
                          Assured
                        </span>
                      </div>

                      {/* PRICE */}

                      <div className="price-section">
                        <span className="current-price">
                          ₹{price.toLocaleString("en-IN")}
                        </span>

                        <span className="old-price">
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>

                        <span className="discount">{discount}% off</span>
                      </div>

                      {/* PROTECT PROMISE */}

                      <div className="protect-promise">
                        + ₹109 Protect Promise Fee
                        <span className="info-icon">i</span>
                      </div>

                      {/* DELIVERY */}

                      <div className="delivery-date">
                        Delivery by <strong>{getDeliveryDate(item)}</strong>
                        <span className="free-delivery">FREE</span>
                      </div>
                    </div>

                    {/* ITEM TOTAL */}

                    <div className="item-total">
                      <span>Item Price</span>

                      <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  {/* ==========================
                      ACTION BAR
                  =========================== */}

                  <div className="cart-action-bar">
                    <button
                      className="cart-action"
                      onClick={() => saveForLater(item)}
                    >
                      <span className="action-icon">♡</span>
                      SAVE FOR LATER
                    </button>

                    <button
                      className="cart-action"
                      onClick={() => removeCart(item)}
                    >
                      <span className="action-icon">🗑</span>
                      REMOVE
                    </button>

                    <button
                      className="cart-action buy-action"
                      onClick={() => buyNow(item)}
                    >
                      <span className="action-icon">⚡</span>
                      BUY THIS NOW
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================
            RIGHT SIDE
        ==================================== */}

        <div className="cart-right">
          <div className="price-details-card">
            <div className="price-details-title">PRICE DETAILS</div>

            {/* PRICE */}

            <div className="price-row">
              <span>
                Price ({priceData.totalItems}{" "}
                {priceData.totalItems === 1 ? "item" : "items"})
              </span>

              <span>₹{priceData.originalPrice.toLocaleString("en-IN")}</span>
            </div>

            {/* DISCOUNT */}

            <div className="price-row">
              <span>Discounts</span>

              <span className="green-text">
                − ₹{totalDiscount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* DELIVERY */}

            <div className="price-row">
              <span>Delivery Charges</span>

              <span>
                {deliveryFee === 0 ? (
                  <span className="green-text">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            {/* PROTECT */}

            <div className="price-row">
              <span>Protect Promise</span>

              <span>₹{protectFee.toLocaleString("en-IN")}</span>
            </div>

            <div className="price-divider" />

            {/* TOTAL */}

            <div className="total-row">
              <strong>Total Amount</strong>

              <strong>₹{finalAmount.toLocaleString("en-IN")}</strong>
            </div>

            <div className="price-divider" />

            {/* SAVING */}

            <div className="saving-text">
              <span className="saving-icon">%</span>
              You'll save ₹{totalDiscount.toLocaleString("en-IN")} on this
              order!
            </div>

            {/* PLACE ORDER */}

            <button className="place-order-btn" onClick={placeOrder}>
              PLACE ORDER
            </button>
          </div>

          {/* SECURE PAYMENT */}

          <div className="secure-payment">
            <div className="secure-icon">🛡</div>

            <div>
              <strong>Safe and secure payments</strong>

              <p>Easy returns. 100% Authentic products.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
