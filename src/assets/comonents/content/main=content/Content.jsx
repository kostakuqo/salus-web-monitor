import React, { useState } from 'react';
import './Content.css';
import UtaContainer from '../uta/UtaContainer';
import ChillerContainer from '../chiller/ChillerContainer';
import KaldajaContainer from '../kaldaja/KaldajaContainer';
import UtaInterface from '../uta/UtaInterface';
import ChillerInterface from '../chiller/ChillerInterface';
import KaldajaInterface from '../kaldaja/KaldajaInterface';

export default function Content() {

  const [activePage, setActivePage] = useState(null);

  return (
    <div className="content-grid">

      {activePage === null && (
        <>
          <UtaContainer onUtaClick={() => setActivePage("uta")} />
          <ChillerContainer onChillerClick={() => setActivePage("chiller")} />
          <KaldajaContainer onKaldajaClick={() => setActivePage("kaldaja")} />
        </>
      )}

      {activePage === "uta" && (
        <UtaInterface onBack={() => setActivePage(null)} />
      )}

      {activePage === "chiller" && (
        <ChillerInterface onBack={() => setActivePage(null)} />
      )}
      {activePage === "kaldaja" && (
        <KaldajaInterface onBack={() => setActivePage(null)} />
      )}

    </div>
  );
}