import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from './assets/comonents/Header/Header';
import Menu from './assets/comonents/menu-left/Menu';
import Content from './assets/comonents/content/main=content/Content';
import HomePage from "./assets/comonents/menu-items/home/Homepage";
import './App.css';
import HartaPage from "./assets/comonents/menu-items/harta/HartaPage";
import GraphicsPage from "./assets/comonents/menu-items/general/GraphicPage";

// App.jsx
export default function AppWrapper() {
  const [resetTrigger, setResetTrigger] = useState(false);

  return (
    <Router>
      <Header />
      <div className="main-layout">
        <Menu onNavigate={() => setResetTrigger(prev => !prev)} />
        <div className="content">
          <Routes>
            {/* Home – pagina de intro */}
            <Route path="/" element={<HomePage />} />
            <Route path="/homepage" element={<HomePage />} />

            {/* Dashboard */}
            <Route path="/dashboard/*" element={<Content resetTrigger={resetTrigger} />} />

            {/* Pagini UTA / Chiller / Kaldaja */}
            <Route path="/uta/*" element={<Content resetTrigger={resetTrigger} />} />
            <Route path="/chiller/*" element={<Content resetTrigger={resetTrigger} />} />
            <Route path="/kaldaja/*" element={<Content resetTrigger={resetTrigger} />} />

            {/* Pagini Menu – Settings / General / Profile – Bosh për momentin */}
            <Route path="/settings" element={null} />
            <Route path="/general" element={null} />
            <Route path="/profile" element={null} />

            {/* Harta – afișează vetëm AppUta */}
            <Route path="/harta/*" element={<HartaPage />} />
            <Route path="/graphics/*" element={<GraphicsPage />} />

            {/* Orice alt URL → redirect la home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}