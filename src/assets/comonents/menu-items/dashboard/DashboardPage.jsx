import React from "react";
import DashboardUtaPage from "./DashboardUtaPage";
import "./DashboardPage.css";

export default function DashboardPage() {
  const handleUtaClick = (uta) => {
    console.log("UTA selectat:", uta.id);
    // aici poți naviga către pagina UTA detaliu
  };

  const handleChillerClick = (chiller) => {
    console.log("Chiller selectat:", chiller.id);
    
  };

  return (
    <div className="dashboard-page">


      <section>

        <DashboardUtaPage onUtaClick={handleUtaClick} />
      </section>

      <section>

        <DashboardChillerPage onChillerClick={handleChillerClick} />
      </section>
    </div>
  );
}