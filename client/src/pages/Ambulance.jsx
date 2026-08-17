import "./Ambulance.css";
import {
  FaAmbulance,
  FaHospital,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaHeartbeat,
  FaClock,
} from "react-icons/fa";

const ambulanceTypes = [
  {
    id: 1,
    title: "Basic Ambulance",
    icon: <FaAmbulance />,
    price: "₹800 - ₹1500",
    time: "5 - 10 min",
  },
  {
    id: 2,
    title: "ICU Ambulance",
    icon: <FaHeartbeat />,
    price: "₹2500 - ₹5000",
    time: "10 - 15 min",
  },
  {
    id: 3,
    title: "Hospital Transfer",
    icon: <FaHospital />,
    price: "₹1500 - ₹3000",
    time: "10 - 20 min",
  },
];

export default function Ambulance() {
  return (
    <div className="ambulance-page">
      {/* Hero */}
      <div className="ambulance-banner">
        <h1>🚑 Emergency Ambulance</h1>
        <p>24×7 Ambulance Service at Your Location</p>

        <button className="call-btn">
          <FaPhoneAlt />
          Call Emergency
        </button>
      </div>

      {/* Location */}
      <div className="location-box">
        <FaMapMarkerAlt />
        <input type="text" placeholder="Enter Pickup Location" />
      </div>

      <h2 className="section-title">Choose Ambulance</h2>

      <div className="ambulance-grid">
        {ambulanceTypes.map((item) => (
          <div className="ambulance-card" key={item.id}>
            <div className="ambulance-icon">{item.icon}</div>

            <h3>{item.title}</h3>

            <p>
              <FaClock />
              {item.time}
            </p>

            <h4>{item.price}</h4>

            <button>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
