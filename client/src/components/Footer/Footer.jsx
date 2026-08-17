import "./Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-column">
          <h3>ApnaBazar</h3>
          <p>
            Your one-stop destination for Shopping,
            Blinkit Delivery, Home Services,
            Mechanics and Ambulance.
          </p>

          <div className="social-icons">
            <FaFacebookF />
            <FaInstagram />
            <FaTwitter />
            <FaYoutube />
            <FaLinkedin />
          </div>
        </div>

        <div className="footer-column">
          <h4>Company</h4>

          <a href="/">About Us</a>
          <a href="/">Careers</a>
          <a href="/">Press</a>
          <a href="/">Blog</a>
        </div>

        <div className="footer-column">
          <h4>Help</h4>

          <a href="/">Customer Care</a>
          <a href="/">Returns</a>
          <a href="/">Cancellation</a>
          <a href="/">FAQs</a>
        </div>

        <div className="footer-column">
          <h4>Services</h4>

          <a href="/shopping">Shopping Mall</a>
          <a href="/blinkit">Blinkit 10 Min</a>
          <a href="/home-services">Home Services</a>
          <a href="/mechanics">Mechanics</a>
          <a href="/ambulance">Ambulance</a>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>

          <p>Email</p>
          <span>support@apnabazar.com</span>

          <p>Phone</p>
          <span>+91 9876543210</span>

          <p>Location</p>
          <span>Jaipur, Rajasthan</span>
        </div>

      </div>

      <hr />

      <div className="footer-bottom">

        <p>
          © 2026 ApnaBazar. All Rights Reserved.
        </p>

        <div className="payment-icons">
          💳 Visa &nbsp; 💳 MasterCard &nbsp; 💰 UPI
        </div>

      </div>

    </footer>
  );
}