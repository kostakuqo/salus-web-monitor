import React from "react";
import "./DashboardUtaCard.css";

export default function DashboardUtaCard({ id, status, onClick }) {
  return (
    <div className="dashboard-uta-card" onClick={onClick}>
      <h3 className="uta-id">{id}</h3>

      <div className="status-container">
        {/* indicator colorat ON / OFF */}
        <span className={`status-indicator ${status.toLowerCase()}`}></span>
        {/* textul statusului */}
        <span className={`status-text ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>
    </div>
  );
}