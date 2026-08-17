import { useState, useEffect } from "react";
import slides from "./categoryBanners";
import "./slider.css";

function Slider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider">
      <div 
        className="slider-track"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((img, index) => (
          <img key={index} src={img} alt="Banner" />
        ))}
      </div>
    </div>
  );
}

export default Slider;