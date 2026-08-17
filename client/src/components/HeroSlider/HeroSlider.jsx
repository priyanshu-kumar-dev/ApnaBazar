import { useEffect, useState } from "react";
import banners from "../../data/banners";
import "./HeroSlider.css";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-slider">
      <img src={banners[current]} alt="Banner" />
    </div>
  );
}