import React from "react";
import { useNavigate } from "react-router-dom"; // ← import
import "./Profile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const navigate = useNavigate(); // ← hook pentru navigare

  return (
    <div
      className="profile-button"
      onClick={() => navigate("/profile")} // ← navighează la /profile
    >
      <FontAwesomeIcon icon={faUser} className="menu-icon" />
      <span>Profile</span>
    </div>
  );
}