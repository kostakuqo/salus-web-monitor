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
import DashboardChillerPage from '../../menu-items/dashboard/DashboardChillerPage';

export default function Content({ resetTrigger }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedUta, setSelectedUta] = useState(null);
  const [selectedChiller, setSelectedChiller] = useState(null);
  const [fromDashboard, setFromDashboard] = useState(false);

  
  const resetContentState = () => {
    setSelectedUta(null);
    setSelectedChiller(null);
    setFromDashboard(false);
  };

  useEffect(() => resetContentState(), [location.pathname, resetTrigger]);

  const handleBack = () => {
    if (selectedUta) setSelectedUta(null);
    if (selectedChiller) setSelectedChiller(null);

    if (fromDashboard) {
      navigate("/dashboard");
    } else {
      navigate("/"); 
    }
  };

  const currentPage = location.pathname.split("/")[1] || "";

  return (
    <div className="content-grid">

      {/* === Detalii UTA selectat === */}
      {selectedUta ? (
        <UtaInterface uta={selectedUta} onBack={handleBack} />

      ) : selectedChiller ? (
        <ChillerInterface onBack={handleBack} chiller={selectedChiller} />

      ) : currentPage === "dashboard" ? (
        <>


          <section>

            <div className='dashboard-container'>
              <DashboardUtaPage
                onUtaClick={(uta) => {
                  setSelectedUta(uta);
                  setFromDashboard(true);
                }}
              />
            </div>
          </section>

          <section>

            <div className='dashboard-container'>
              <DashboardChillerPage
                onChillerClick={(chiller) => {
                  setSelectedChiller(chiller);
                  setFromDashboard(true);
                }}
              />
            </div>
          </section>
        </>

      ) : currentPage === "uta" ? (
        <UtaInterface onBack={handleBack} />

      ) : currentPage === "chiller" ? (
        <ChillerInterface onBack={handleBack} />

      ) : currentPage === "kaldaja" ? (
        <KaldajaInterface onBack={handleBack} />

      ) : currentPage === "" ? (
        <>
          {/* Pagina principală "/" cu containere */}
          <UtaContainer onUtaClick={(uta) => setSelectedUta(uta)} />
          <ChillerContainer onChillerClick={(chiller) => setSelectedChiller(chiller)} />
          <KaldajaContainer onKaldajaClick={() => navigate("/kaldaja")} />
        </>
      ) : null /* Pagini precum settings/general/harta/profile → nu afișează nimic */}
    </div>
  );
}