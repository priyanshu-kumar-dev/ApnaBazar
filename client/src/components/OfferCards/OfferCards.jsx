import "./OfferCards.css";

const offers = [
  {
    title: "Super Sale",
    subtitle: "Up to 70% OFF",
    color: "#2874f0",
  },
  {
    title: "Blinkit",
    subtitle: "10 Min Delivery",
    color: "#0f9d58",
  },
  {
    title: "Home Services",
    subtitle: "Starting ₹99",
    color: "#ff9800",
  },
  {
    title: "Ambulance",
    subtitle: "24×7 Emergency",
    color: "#d32f2f",
  },
];

export default function OfferCards() {
  return (
    <div className="offer-container">
      {offers.map((offer, index) => (
        <div
          className="offer-card"
          key={index}
          style={{ background: offer.color }}
        >
          <h3>{offer.title}</h3>
          <p>{offer.subtitle}</p>
        </div>
      ))}
    </div>
  );
}