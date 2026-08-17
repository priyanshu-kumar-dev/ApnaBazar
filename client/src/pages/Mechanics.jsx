import "./Mechanics.css";
import { useNavigate } from "react-router-dom";

import {
  FaMotorcycle,
  FaCar,
  FaTruck,
  FaTools,
  FaOilCan,
  FaBatteryHalf,
  FaCogs,
  FaTruckMonster,
  FaTractor,
  FaWrench,
} from "react-icons/fa";

const services = [
  {
    id: 1,
    title: "Bike Service",
    icon: <FaMotorcycle />,
    price: 599,
    desc: "General Service & Repair",
  },
  {
    id: 2,
    title: "Car Service",
    icon: <FaCar />,
    price: 599,
    desc: "Complete Car Inspection",
  },
  {
    id: 3,
    title: "Truck Service",
    icon: <FaTruck />,
    price: 599,
    desc: "Heavy Vehicle Repair",
  },
  {
    id: 4,
    title: "Engine Repair",
    icon: <FaTools />,
    price: 599,
    desc: "Engine Diagnostics",
  },
  {
    id: 5,
    title: "Oil Change",
    icon: <FaOilCan />,
    price: 599,
    desc: "Engine Oil Replacement",
  },
  {
    id: 6,
    title: "Battery Service",
    icon: <FaBatteryHalf />,
    price: 599,
    desc: "Battery Check & Replace",
  },
  {
    id: 7,
    title: "Motor Repair",
    icon: <FaCogs />,
    price: 599,
    desc: "Electric Motor Repair",
  },
  {
    id: 8,
    title: "Tyre Service",
    icon: <FaTruckMonster />,
    price: 599,
    desc: "Tyre Repair & Replacement",
  },
  {
    id: 9,
    title: "Tractor Service",
    icon: <FaTractor />,
    price: 599,
    desc: "Tractor Repair & Maintenance",
  },
  {
    id: 10,
    title: "Mechanic",
    icon: <FaWrench />,
    price: 599,
    desc: "General Vehicle Repair",
  },
];

export default function Mechanics() {
  const navigate = useNavigate();

  return (
    <div className="mechanics">
      <div className="mechanic-banner">
        <h1>🔧 Mechanic Services</h1>

        <p>Book trusted mechanics at your doorstep.</p>

        <button>Book Emergency Mechanic</button>
      </div>

      <h2 className="mechanic-heading">Popular Services</h2>

      <div className="mechanic-grid">
        {services.map((service) => (
          <div className="mechanic-card" key={service.id}>
            <div className="mechanic-icon">{service.icon}</div>

            <h3>{service.title}</h3>

            <p>{service.desc}</p>

            <div className="service-bottom">
              <button
                onClick={() =>
                  navigate("/book-service", {
                    state: {
                      service: service.title,
                      desc: service.desc,
                      price: service.price,
                    },
                  })
                }
              >
                Book Now
              </button>

              <span className="service-price">₹{service.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
