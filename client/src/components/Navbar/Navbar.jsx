import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

import {
  FiUser,
  FiPlusCircle,
  FiShoppingBag,
  FiAward,
  FiGift,
  FiBell,
  FiHeadphones,
  FiTrendingUp,
  FiDownload,
  FiChevronDown,
  FiHeart,
  FiSearch,
  FiShoppingCart,
  FiPackage,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const navigate = useNavigate();

  /* =========================================================
     MENU STATES
  ========================================================= */

  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  /* =========================================================
     USER
  ========================================================= */

  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem("userData");

      if (!userData) {
        return null;
      }

      return JSON.parse(userData);
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  });

  /* =========================================================
     GET CART COUNT

     Example:

     cart:
     [
       { id: 1, quantity: 1 },
       { id: 2, quantity: 1 },
       { id: 3, quantity: 1 },
       { id: 4, quantity: 1 }
     ]

     Badge = 4

     If:
     [
       { id: 1, quantity: 2 },
       { id: 2, quantity: 2 }
     ]

     Badge = 4
  ========================================================= */

  const getCartCount = () => {
    try {
      const cartData = localStorage.getItem("cart");

      if (!cartData) {
        return 0;
      }

      const cartItems = JSON.parse(cartData);

      if (!Array.isArray(cartItems)) {
        return 0;
      }

      let total = 0;

      cartItems.forEach((item) => {
        const quantity = Number(item?.quantity);

        if (
          Number.isFinite(quantity) &&
          quantity > 0
        ) {
          total += quantity;
        } else {
          total += 1;
        }
      });

      return total;
    } catch (error) {
      console.error(
        "Cart count error:",
        error
      );

      return 0;
    }
  };

  /* =========================================================
     CART COUNT STATE
  ========================================================= */

  const [cartCount, setCartCount] = useState(() => {
    return getCartCount();
  });

  /* =========================================================
     UPDATE CART COUNT
  ========================================================= */

  const updateCartCount = () => {
    const newCount = getCartCount();

    setCartCount(newCount);
  };

  /* =========================================================
     CART EVENTS
  ========================================================= */

  useEffect(() => {
    /*
      First page load
    */

    updateCartCount();

    /*
      Add to Cart / Remove Cart ke baad
    */

    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    /*
      Agar localStorage kisi doosre tab/window
      se change ho
    */

    window.addEventListener(
      "storage",
      updateCartCount
    );

    /*
      Browser window dobara active hone par
    */

    window.addEventListener(
      "focus",
      updateCartCount
    );

    /*
      Page visible hone par
    */

    document.addEventListener(
      "visibilitychange",
      updateCartCount
    );

    /*
      Backup check.
      Agar kisi jagah event dispatch nahi hua,
      tab bhi badge update ho jayega.
    */

    const interval = setInterval(() => {
      updateCartCount();
    }, 500);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );

      window.removeEventListener(
        "focus",
        updateCartCount
      );

      document.removeEventListener(
        "visibilitychange",
        updateCartCount
      );

      clearInterval(interval);
    };
  }, []);

  /* =========================================================
     USER UPDATE
  ========================================================= */

  useEffect(() => {
    const updateUser = () => {
      try {
        const userData =
          localStorage.getItem("userData");

        if (!userData) {
          setUser(null);
          return;
        }

        setUser(JSON.parse(userData));
      } catch (error) {
        console.error(
          "User update error:",
          error
        );

        setUser(null);
      }
    };

    window.addEventListener(
      "userUpdated",
      updateUser
    );

    window.addEventListener(
      "storage",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "userUpdated",
        updateUser
      );

      window.removeEventListener(
        "storage",
        updateUser
      );
    };
  }, []);

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <nav className="navbar">

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="logo">
        ApnaBazar
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="search">

        <FiSearch />

        <input
          type="text"
          placeholder="Search for Products, Brands and More"
        />

      </div>

      {/* =================================================
          RIGHT SECTION
      ================================================= */}

      <div className="navbar-right">

        {/* =================================================
            LOGIN
        ================================================= */}

        <div
          className="login-wrapper"
          onMouseEnter={() =>
            setShowLoginMenu(true)
          }
          onMouseLeave={() =>
            setShowLoginMenu(false)
          }
        >

          <button
            className="login-button"
            onClick={() =>
              navigate("/login")
            }
          >

            <FiUser />

            <span>
              {user?.name || "Login"}
            </span>

            <FiChevronDown
              className={
                showLoginMenu
                  ? "rotate"
                  : ""
              }
            />

          </button>

          {/* LOGIN DROPDOWN */}

          {showLoginMenu && (
            <div className="login-dropdown">

              <div className="dropdown-top">

                <span>
                  New Customer?
                </span>

                <button
                  className="signup-link"
                  onClick={() =>
                    navigate("/signup")
                  }
                >
                  Sign Up
                </button>

              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/profile")
                }
              >
                <FiUser />
                <span>
                  My Profile
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/plus-zone")
                }
              >
                <FiPlusCircle />
                <span>
                  ApnaKart Plus Zone
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/orders")
                }
              >
                <FiPackage />
                <span>
                  Orders
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/wishlist")
                }
              >
                <FiHeart />
                <span>
                  Wishlist
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/rewards")
                }
              >
                <FiAward />
                <span>
                  Rewards
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/gift-cards")
                }
              >
                <FiGift />
                <span>
                  Gift Cards
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate(
                    "/notification-preferences"
                  )
                }
              >
                <FiBell />
                <span>
                  Notification Preferences
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/customer-care")
                }
              >
                <FiHeadphones />
                <span>
                  24 × 7 Customer Care
                </span>
              </div>

              <div
                className="dropdown-item logout"
                onClick={() =>
                  navigate("/logout")
                }
              >
                <FiLogOut />
                <span>
                  Logout
                </span>
              </div>

            </div>
          )}

        </div>

        {/* =================================================
            MORE
        ================================================= */}

        <div
          className="more-wrapper"
          onMouseEnter={() =>
            setShowMoreMenu(true)
          }
          onMouseLeave={() =>
            setShowMoreMenu(false)
          }
        >

          <button className="more-button">

            <span>
              More
            </span>

            <FiChevronDown
              className={
                showMoreMenu
                  ? "rotate"
                  : ""
              }
            />

          </button>

          {/* MORE DROPDOWN */}

          {showMoreMenu && (
            <div className="more-dropdown">

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/seller")
                }
              >
                <FiShoppingBag />
                <span>
                  Become a Seller
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate(
                    "/customer-support"
                  )
                }
              >
                <FiHelpCircle />
                <span>
                  Customer Support
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate(
                    "/notification-settings"
                  )
                }
              >
                <FiBell />
                <span>
                  Notification Settings
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/advertise")
                }
              >
                <FiTrendingUp />
                <span>
                  Advertise on ApnaBazarKart
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/download-app")
                }
              >
                <FiDownload />
                <span>
                  Download App
                </span>
              </div>

            </div>
          )}

        </div>

        {/* =================================================
            CART
        ================================================= */}

        <button
          className="cart-btn"
          onClick={() =>
            navigate("/cart")
          }
        >

          <div className="cart-icon-wrapper">

            <FiShoppingCart />

            {/* =================================================
                CART BADGE

                1 item  -> 🔴 1
                2 items -> 🔴 2
                3 items -> 🔴 3
                4 items -> 🔴 4
                Empty    -> badge hidden
            ================================================= */}

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}

          </div>

          <span>
            Cart
          </span>

        </button>

      </div>

    </nav>
  );
}