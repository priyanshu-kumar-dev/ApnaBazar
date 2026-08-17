import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import HeroSlider from "../components/HeroSlider/HeroSlider";
import OfferCard from "../components/OfferCards/OfferCards";



const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-page">
      {/* Hero Banner */}
      <HeroSlider />

      {/* Categories */}
      <section className="category-section">
        <h2 className="section-title">Top Categories</h2>

        <div className="category-grid">
          <div
            className="category-box"
            onClick={() => navigate("/shopping-mall")}
          >
            🏬
            <span>Shopping Mall</span>
          </div>

          <div
            className="category-box"
            onClick={() => navigate("/home-services")}
          >
            🏠
            <span>Home Services</span>
          </div>

          <div className="category-box" onClick={() => navigate("/mechanics")}>
            🏍️
            <span>Mechanics</span>
          </div>

          <div className="category-box" onClick={() => navigate("/blinkit")}>
            🛒
            <span>Blinkit</span>
          </div>

          <div className="category-box" onClick={() => navigate("/ambulance")}>
            🚑
            <span>Ambulance</span>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Home;
