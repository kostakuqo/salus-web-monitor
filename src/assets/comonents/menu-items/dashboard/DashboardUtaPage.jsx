import React from "react";
import { initialUtaData } from "../../content/uta/uta data/utaData";
import DashboardUtaCard from "./DashboardUtaCard";
import "./Dashboard.css"

export default function DashboardUtaPage({ onUtaClick }) {
  console.log("DashboardUtaPage render"); // 🔹 verifică dacă se afișează pagina
  return (
    <div className="dashboard-page">
      <h2>UTA Status</h2>
      <div className="dashboard-grid">
        {initialUtaData.map((uta) => (
          <DashboardUtaCard
            key={uta.id}
            id={uta.id}
            status={uta.status}
            onClick={() => {
              console.log("Card clicked:", uta.id); // 🔹 verifică click pe card
              onUtaClick(uta);
            }}
          />
        ))}
      </div>
    </div>
  );
}