import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // Demo
  // Baad me backend API se replace karenge
  const user = {
    name: "Priyanshu Kumar",
    mobile: "9876543210",
    email: "Not Added",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-header">
          <div className="profile-avatar">
            👤
          </div>

          <div>
            <h2>{user.name}</h2>
            <p>{user.mobile}</p>
          </div>
        </div>

        <hr />

        <div className="profile-info">

          <div className="info-row">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="info-row">
            <span>Mobile</span>
            <strong>{user.mobile}</strong>
          </div>

          <div className="info-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </div>
  );
};

export default Profile;