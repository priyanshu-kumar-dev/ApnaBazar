import { useState } from "react";
import "./ShoppingMall.css";
import "../data/ForYouProducts.css";
import category from "../data/Categories.js";
import forYouProducts from "../data/ForYouProduct.js";
import categoryBanners from "../data/categoryBanners";
import HeroSliders from "../components/HeroSliders/HeroSliders";

import { useNavigate } from "react-router-dom";

import {
  FaMobileAlt,
  FaLaptop,
  FaTshirt,
  FaHome,
  FaTv,
  FaShoppingBag,
  FaPaintBrush,
  FaGamepad,
  FaHamburger,
  FaCouch,
  FaFootballBall,
  FaBook,
  FaMotorcycle,
  FaTools,
} from "react-icons/fa";

const categories = [
  { id: 0, name: "For You", icon: <FaShoppingBag />, color: "#ffffff" },
  { id: 1, name: "Fashion", icon: <FaTshirt />, color: "#FCE4EC" },
  { id: 2, name: "Mobiles", icon: <FaMobileAlt />, color: "#E3F2FD" },
  { id: 3, name: "Electronics", icon: <FaLaptop />, color: "#E8F5E9" },
  { id: 4, name: "Beauty", icon: <FaPaintBrush />, color: "#FCE4EC" },
  { id: 5, name: "Home", icon: <FaHome />, color: "#FFF8E1" },
  { id: 6, name: "Appliances", icon: <FaTv />, color: "#F3E5F5" },
  { id: 7, name: "Toys", icon: <FaGamepad />, color: "#FFF3E0" },
  { id: 8, name: "Food", icon: <FaHamburger />, color: "#E8F5E9" },
  { id: 9, name: "Sports", icon: <FaFootballBall />, color: "#E3F2FD" },
  { id: 10, name: "Furniture", icon: <FaCouch />, color: "#EFEBE9" },
  { id: 11, name: "Books", icon: <FaBook />, color: "#F3E5F5" },
  { id: 12, name: "Auto Accessories", icon: <FaTools />, color: "#FFF8E1" },
  { id: 13, name: "Two Wheelers", icon: <FaMotorcycle />, color: "#E8EAF6" },
];

export default function ShoppingMall() {
  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const filteredProducts =
  selectedCategory === "For You"
    ? forYouProducts.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      )
    : [...category, ...forYouProducts].filter((product) => {
        const categoryMatch = product.category === selectedCategory;

        const searchMatch = product.title
          .toLowerCase()
          .includes(search.toLowerCase());

        return categoryMatch && searchMatch;
      });

  return (
    <div className="shopping">
      <div className="shopping-banner">
        <h1>🛍 Shopping Mall</h1>

        <p>Everything you need, all in one place.</p>

        <input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <h2 className="title">Shop by Category</h2>

      <div className="category-grid">
        {categories.map((item) => (
          <div
            key={item.id}
            className={`category-card ${
              selectedCategory === item.name ? "active-category" : ""
            }`}
            onClick={() => setSelectedCategory(item.name)}
          >
            <div
              className="category-icon"
              style={{
                backgroundColor: item.color,
              }}
            >
              {item.icon}
            </div>

            <span className="category-name">{item.name}</span>
          </div>
        ))}
      </div>
      <h2 className="title">
        {selectedCategory === "For You"
          ? "Recommended Products"
          : selectedCategory}
      </h2>
      <HeroSliders slides={categoryBanners[selectedCategory]} />
      <div className="product-grid">
        {filteredProducts.map((item) => (
          <div
            key={item.id}
            className={`product-card ${
              item.source === "forYou" ? "for-you-card for-you-large" : ""
            }`}
            onClick={() => navigate(`/similar/${item.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div
              className={`product-image ${item.bigImage ? "big-image" : ""}`}
            >
              <img src={item.image} alt={item.title} />
            </div>

            <div className="product-info">
              <h3>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
