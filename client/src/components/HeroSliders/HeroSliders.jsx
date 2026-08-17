import { useState, useEffect } from "react";
import "./HeroSliders.css";

function HeroSliders({ slides = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev + 3 >= slides.length ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [slides]);

  return (
    <div className="hero-sliders">
      <div
        className="slider-track"
        style={{
          transform: `translateX(-${current * 33.33}%)`,
        }}
      >
        {slides.map((img, index) => (
          <img key={index} src={img} alt="banner" />
        ))}
      </div>
    </div>
  );
}

export default HeroSliders;