import React, { useState } from 'react';
import './Content.css';
import UtaContainer from './UtaContainer';
import ChillerContainer from './ChillerContainer';
import KaldajaContainer from './KaldajaContainer';
import UtaInterface from './UtaInterface';
import ChillerInterface from './ChillerInterface';
import KaldajaInterface from './KaldajaInterface';

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