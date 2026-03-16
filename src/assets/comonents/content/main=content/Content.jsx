import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Content.css';
import UtaContainer from '../uta/UtaContainer';
import ChillerContainer from '../chiller/ChillerContainer';
import KaldajaContainer from '../kaldaja/KaldajaContainer';
import UtaInterface from '../uta/UtaInterface';
import ChillerInterface from '../chiller/ChillerInterface';
import KaldajaInterface from '../kaldaja/KaldajaInterface';
import DashboardUtaPage from '../../menu-items/dashboard/DashboardUtaPage';

export default function Content({ resetTrigger }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedUta, setSelectedUta] = useState(null);
  const [fromDashboard, setFromDashboard] = useState(false);

  const resetContentState = () => {
    setSelectedUta(null);
    setFromDashboard(false);
  };

  // Reset la schimbarea URL sau trigger din meniu
  useEffect(() => resetContentState(), [location.pathname, resetTrigger]);

  const handleBack = () => {
    setSelectedUta(null);
    if (fromDashboard) {
      navigate("/dashboard");
    } else {
      navigate("/"); // pagina principală cu cele trei containere
    }
  };

  // Primul segment al URL-ului (ex: "dashboard", "settings")
  const currentPage = location.pathname.split("/")[1] || "";

  return (
    <div className="content-grid">

      {/* Dacă un UTA a fost selectat */}
      {selectedUta ? (
        <UtaInterface uta={selectedUta} onBack={handleBack} />

      ) : currentPage === "dashboard" ? (
        <DashboardUtaPage
          onUtaClick={(uta) => {
            setSelectedUta(uta);
            setFromDashboard(true);
          }}
        />

      ) : currentPage === "uta" ? (
        <UtaInterface onBack={handleBack} />

      ) : currentPage === "chiller" ? (
        <ChillerInterface onBack={handleBack} />

      ) : currentPage === "kaldaja" ? (
        <KaldajaInterface onBack={handleBack} />

      ) : currentPage === "" ? (
        // **Pagina principală "/" → doar la start**
        <>
          <UtaContainer onUtaClick={(uta) => setSelectedUta(uta)} />
          <ChillerContainer onChillerClick={() => navigate("/chiller")} />
          <KaldajaContainer onKaldajaClick={() => navigate("/kaldaja")} />
        </>

      ) : null /* Pagini precum settings/general/harta/profile → nu afișează nimic */}

    </div>
  );
}