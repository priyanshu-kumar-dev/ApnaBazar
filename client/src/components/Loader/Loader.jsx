import "./Loader.css";

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-box">
        <div className="spinner"></div>

        <h2>ApnaBazar</h2>

        <p>Loading...</p>
      </div>
    </div>
  );
}