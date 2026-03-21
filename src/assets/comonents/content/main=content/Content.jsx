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
import DashboardPage from '../../menu-items/dashboard/DashboardPage';




export default function Content({ resetTrigger, showMapTrigger }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedUta, setSelectedUta] = useState(null);
  const [selectedChiller, setSelectedChiller] = useState(null);
  const [fromDashboard, setFromDashboard] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const resetContentState = () => {
    setSelectedUta(null);
    setSelectedChiller(null);
    setFromDashboard(false);
    setShowMap(false);
  };

  useEffect(() => resetContentState(), [location.pathname, resetTrigger]);

  // Dacă meniul trimite semnalul de a afișa harta
  useEffect(() => {
    if (showMapTrigger) setShowMap(true);
  }, [showMapTrigger]);

  const handleBack = () => {
    setSelectedUta(null);
    setSelectedChiller(null);
    setShowMap(false);
    if (fromDashboard) navigate("/dashboard");
    else navigate("/");
  };

  const handleEquipmentClick = (id) => {
    setShowMap(false);
    if (id.includes("asp")) setSelectedUta({ id, name: id });
    else if (id.includes("chl")) setSelectedChiller({ id, name: id });
  };

  const currentPage = location.pathname.split("/")[1] || "";

  return (
    <div className="content-grid">
      {selectedUta ? (
        <UtaInterface uta={selectedUta} onBack={handleBack} />
      ) : selectedChiller ? (
        <ChillerInterface chiller={selectedChiller} onBack={handleBack} />
      ) : showMap ? (
        <AppUta onEquipmentClick={handleEquipmentClick} />
      ) : currentPage === "dashboard" ? (
        <>
          <DashboardUtaPage onUtaClick={(uta) => { setSelectedUta(uta); setFromDashboard(true); }} />
          
        </>
      ) : currentPage === "uta" ? (
        <UtaInterface onBack={handleBack} />
      ) : currentPage === "chiller" ? (
        <ChillerInterface onBack={handleBack} />
      ) : currentPage === "kaldaja" ? (
        <KaldajaInterface onBack={handleBack} />
      ) : (
        <>
          <UtaContainer onUtaClick={(uta) => setSelectedUta(uta)} />
          <ChillerContainer onChillerClick={(chiller) => setSelectedChiller(chiller)} />
          <KaldajaContainer onKaldajaClick={() => navigate("/kaldaja")} />
        </>
      )}
    </div>
  );
}