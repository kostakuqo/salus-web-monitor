import React from "react";
import { initialChillerData } from "../../content/chiller/data/chillersData";
import { initialUtaData } from "../../content/uta/uta data/utaData";
import DashboardChillerCard from "./DashboardChillerCard";
import "./Dashboard.css";

const chillerToUtaMap = initialUtaData.reduce((map, uta) => {
  const chillerId = uta.chiller?.id;
  if (chillerId) {
    if (!map[chillerId]) map[chillerId] = [];
    map[chillerId].push(uta.id);
  }
  return map;
}, {});

export default function DashboardChillerPage({ onChillerClick }) {
  return (
    <div className="dashboard-page">
      <h2>Chillere</h2>
      <div className="dashboard-grid">
        {initialChillerData.map((chiller) => (
          <DashboardChillerCard
            key={chiller.id}
            chiller={chiller}
            utas={chillerToUtaMap[chiller.id]?.map(id => initialUtaData.find(u => u.id === id)) || []}
            onClick={() => onChillerClick(chiller)}
          />
        ))}
      </div>
    </div>
  );
}