import React from "react";
import "./Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  return (
    <div className="menu-item">
      <FontAwesomeIcon icon={faHome} className="menu-icon" />
      <span>Dashboard</span>
    </div>
  );
}