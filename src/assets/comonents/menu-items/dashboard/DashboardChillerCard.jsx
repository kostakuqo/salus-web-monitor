
import React from "react";
import "./DashboardChillerCard.css";

export default function DashboardChillerCard({ chiller, onClick }) {
  const statusSafe = (chiller.status || "OFF").toLowerCase();

  return (
    <div className="dashboard-chiller-card" onClick={onClick}>
      <h3 className="chiller-id">{chiller.id}</h3>
      <div className="status-container">
        <span className={`status-indicator ${statusSafe}`}></span>
        <span className={`status-text ${statusSafe}`}>{chiller.status}</span>
      </div>
    </div>
  );
}