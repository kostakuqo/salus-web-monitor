import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faTableColumns } from "@fortawesome/free-solid-svg-icons";


export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div
      className="menu-dashboard-button"
      onClick={() => navigate("/dashboard")}
    >
      <FontAwesomeIcon icon={faTableColumns} className="menu-icon" />
      <span>Dashboard</span>
    </div>
  );
}