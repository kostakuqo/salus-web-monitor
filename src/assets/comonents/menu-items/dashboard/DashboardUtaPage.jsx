import React from "react";
import DashboardUtaCard from "./DashboardUtaCard";
import "./Dashboard.css";
import{useUta} from "../../../../services/UtaProvider"

export default function DashboardUtaPage({ onUtaClick }) {
  const { utas } = useUta(); // preia datele din context

  console.log("DashboardUtaPage render cu utas:", utas);

  return (
    <div className="dashboard-page">
      <h2>UTA</h2>
      <div className="dashboard-grid">
        {utas.map((uta) => (
          <DashboardUtaCard
            key={uta.id}
            id={uta.id}
            status={uta.status}
            onClick={() => {
              console.log("Card clicked:", uta.id);
              onUtaClick(uta);
            }}
          />
        ))}
      </div>
    </div>
  );
}