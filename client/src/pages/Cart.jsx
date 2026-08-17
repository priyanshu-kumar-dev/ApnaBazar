import "./Cart.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || [],
  );

  const removeCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);

    setCart(updatedCart);

    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div className="cart-page">
      <h1>My Cart</h1>

      {cart.length === 0 ? (
        <h2>Cart Empty</h2>
      ) : (
        cart.map((item) => (
          <div className="cart-card" key={item.id}>
            {/* Image */}

            <div className="cart-image">
              <img src={item.image} alt={item.title} />
            </div>

            {/* Details */}

            <div className="cart-details">
              <h2>{item.title}</h2>

              <div className="rating-box">
                ⭐ {item.rating || 4.2}
                <span>({item.reviews || 109} Ratings)</span>
              </div>

              <div className="price-section">
                <span className="discount">{item.discount || 25}% off</span>

                <span className="old-price">
                  ₹{item.originalPrice || item.price}
                </span>

                <span className="price">₹{item.price}</span>
              </div>

              <p>
                <b>Brand:</b> {item.brand || "Unknown"}
              </p>

              <p>
                <b>Variant:</b> {item.variant || "128 GB + 6 GB"}
              </p>

              <p>
                <b>Color:</b> {item.color || "Default"}
              </p>

              {item.description && (
                <p>
                  <b>Description:</b> {item.description}
                </p>
              )}

              <div className="cart-buttons">
                <button
                  className="remove-btn"
                  onClick={() => removeCart(item.id)}
                >
                  Remove Cart
                </button>

                <button
                  className="details-btn"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  Product Details
                </button>

                <button
                  className="buy-btn"
                  onClick={() => navigate("/booking-address")}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Cart;
