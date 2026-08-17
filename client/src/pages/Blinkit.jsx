import "./Blinkit.css";
import {
  FaAppleAlt,
  FaCarrot,
  FaBreadSlice,
  FaGlassWhiskey,
  FaIceCream,
  FaShoppingBasket,
} from "react-icons/fa";

const categories = [
  {
    id: 1,
    title: "Fruits",
    icon: <FaAppleAlt />,
    color: "#E8F5E9",
  },
  {
    id: 2,
    title: "Vegetables",
    icon: <FaCarrot />,
    color: "#FFF3E0",
  },
  {
    id: 3,
    title: "Bakery",
    icon: <FaBreadSlice />,
    color: "#FFF8E1",
  },
  {
    id: 4,
    title: "Beverages",
    icon: <FaGlassWhiskey />,
    color: "#E3F2FD",
  },
  {
    id: 5,
    title: "Ice Cream",
    icon: <FaIceCream />,
    color: "#FCE4EC",
  },
  {
    id: 6,
    title: "Daily Needs",
    icon: <FaShoppingBasket />,
    color: "#F3E5F5",
  },
];

export default function Blinkit() {
  return (
    <div className="blinkit">
      <div className="blinkit-banner">
        <h1>⚡ Blinkit</h1>
        <p>Delivery in 10 Minutes</p>

        <input type="text" placeholder="Search groceries..." />
      </div>

      <h2 className="section-title">Shop by Category</h2>

      <div className="category-grid">
        {categories.map((item) => (
          <div
            className="category-card"
            key={item.id}
            style={{ background: item.color }}
          >
            <div className="category-icon">{item.icon}</div>

            <h3>{item.title}</h3>

            <button>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}
