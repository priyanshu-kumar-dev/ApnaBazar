import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import HomeServices from "../pages/HomeServices";
import Blinkit from "../pages/Blinkit";
import Mechanics from "../pages/Mechanics";
import ShoppingMall from "../pages/ShoppingMall";
import Ambulance from "../pages/Ambulance";
import Login from "../pages/Login";
import VerifyOTP from "../pages/VerifyOTP";
import Signup from "../pages/Signup";
import BookService from "../pages/BookService";
import BookingAddress from "../pages/BookingAddress";
import OrderSummary from "../pages/OrderSummary";
import Payment from "../pages/Payment";
import BookingSuccess from "../pages/BookingSuccess";
import SimilarProduct from "../pages/SimilarProduct";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";

function AppRoutes() {
  return (
    <Routes>
      {/* Main Pages */}
      <Route path="/" element={<Home />} />

      <Route path="/home-services" element={<HomeServices />} />

      <Route path="/blinkit" element={<Blinkit />} />

      <Route path="/mechanics" element={<Mechanics />} />

      <Route path="/shopping-mall" element={<ShoppingMall />} />

      <Route path="/similar/:id" element={<SimilarProduct />} />

      <Route path="/product/:id" element={<ProductDetails />} />

      <Route path="/cart" element={<Cart />} />

      {/* Service Pages */}
      <Route path="/ambulance" element={<Ambulance />} />

      <Route path="/book-service" element={<BookService />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />

      <Route path="/verify-otp" element={<VerifyOTP />} />

      <Route path="/signup" element={<Signup />} />

      {/* Booking */}
      <Route path="/booking-address" element={<BookingAddress />} />

      <Route path="/order-summary" element={<OrderSummary />} />

      <Route path="/payment" element={<Payment />} />

      <Route path="/booking-success" element={<BookingSuccess />} />

      <Route path="/orders" element={<Orders />} />
    </Routes>
  );
}

export default AppRoutes;
