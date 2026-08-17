// import services from "../data/services";
import "./HomeServices.css";
import {
  FaBolt,
  FaPaintRoller,
  FaSnowflake,
  FaBroom,
  FaFaucet,
  FaTools,
 
  FaBatteryFull,
  FaSolarPanel,
  FaPencilRuler
} from "react-icons/fa";

const services = [
  {
    id: 1,
    title: "Electrician",
    icon: <FaBolt />,
    desc: "Fan, Switch, Wiring & Repair",
  },
  {
    id: 2,
    title: "Plumber",
    icon: <FaFaucet />,
    desc: "Tap, Pipe & Bathroom Repair",
  },
  {
    id: 3,
    title: "Painter",
    icon: <FaPaintRoller />,
    desc: "House & Office Painting",
  },
  {
    id: 4,
    title: "AC Service",
    icon: <FaSnowflake />,
    desc: "Installation & Repair",
  },
  {
    id: 5,
    title: "Cleaning",
    icon: <FaBroom />,
    desc: "Home Deep Cleaning",
  },
  {
    id: 6,
    title: "Carpenter",
    icon: <FaTools />,
    desc: "Furniture Repair",
  },
  
{
  id: 7,
  title: "Cooler Repair",
  icon: <FaSnowflake />,
  desc: "Cooler Installation & Service",
},
{
  id: 8,
  title: "Inverter Service",
  icon: <FaBatteryFull />,
  desc: "Installation & Battery Repair",
},
{
  id: 9,
  title: "Solar Panel",
  icon: <FaSolarPanel />,
  desc: "Installation & Maintenance",
},
{
  id: 10,
  title: "Designer",
  icon: <FaPencilRuler />,
  desc: "Interior & Graphic Design",
},
];

export default function HomeServices() {
  return (
    <div className="home-services">

      <div className="service-banner">
        <h1>🏠 Home Services</h1>
        <p>Book trusted professionals at your doorstep.</p>
      </div>

      <h2 className="heading">Popular Services</h2>

      <div className="service-grid">
        {services.map((service) => (
          <div className="service-card" key={service.id}>
            <div className="service-icon">{service.icon}</div>

            <h3>{service.title}</h3>

            <p>{service.desc}</p>

            <button>Book Now</button>
          </div>
        ))}
      </div>

    </div>
  );
}