import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div
      className="menu-item"
      onClick={() => navigate("/dashboard")}
    >
      <FontAwesomeIcon icon={faHome} className="menu-icon" />
      <span>Dashboard</span>
    </div>
  );
}