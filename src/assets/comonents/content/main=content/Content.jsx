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
import GraphicsPage from '../../menu-items/general/GraphicPage';
import Settings from '../../menu-items/settings/Settings';
import SettingsPage from '../../menu-items/settings/SettingsPage';


export default function Content({ resetTrigger, showMapTrigger }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedUta, setSelectedUta] = useState(null);
  const [selectedChiller, setSelectedChiller] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const resetContentState = () => {
    setSelectedUta(null);
    setSelectedChiller(null);
    setShowMap(false);
  };

  useEffect(() => resetContentState(), [location.pathname, resetTrigger]);
  useEffect(() => { if (showMapTrigger) setShowMap(true); }, [showMapTrigger]);

  const handleBack = () => {
    setSelectedUta(null);
    setSelectedChiller(null);
    setShowMap(false);
    navigate("/");
  };

  const currentPage = location.pathname.split("/")[1] || "";

  return (
    <div className="content-grid">
      {selectedUta ? (
        <UtaInterface uta={selectedUta} onBack={handleBack} />
      ) : selectedChiller ? (
        <ChillerInterface chiller={selectedChiller} onBack={handleBack} />
      ) : currentPage === "dashboard" ? (
        <DashboardUtaPage onUtaClick={(uta) => setSelectedUta(uta)} />
      ) : currentPage === "graphics" ? (
        <GraphicsPage />
      ) : currentPage === "settings" ? (
        <SettingsPage/>
      ) : currentPage === "uta" ? (
        <UtaInterface onBack={handleBack} />
      ) : currentPage === "chiller" ? (
        <ChillerInterface onBack={handleBack} />
      ) : currentPage === "kaldaja" ? (
        <KaldajaInterface onBack={handleBack} />
      ) : (
        <div>
          <p style={{ color: "#94a3b8" }}>Selectați o pagină din meniu</p>
        </div>
      )}
    </div>
  );
}