import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookService.css";

const BookService = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { service, desc, price } = location.state || {};

  return (
    <div className="booking-page">
      <div className="booking-card">
        <h1>Book {service}</h1>

        <p>{desc}</p>

        <h3 className="service-price">Price: ₹{price}</h3>

        <div className="booking-step">
          <h2>Step 1: Select Vehicle</h2>

          <select>
            <option>Bike</option>

            <option>Car</option>

            <option>Truck</option>

            <option>Tractor</option>
          </select>
        </div>

        <button
          onClick={() =>
            navigate("/booking-address", {
              state: {
                service,

                desc,

                price,
              },
            })
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default BookService;
