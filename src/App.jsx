import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from './assets/comonents/Header/Header';
import Menu from './assets/comonents/menu-left/Menu';
import Content from './assets/comonents/content/main=content/Content';
import HomePage from "./assets/comonents/menu-items/home/Homepage";
import './App.css';
import HartaPage from "./assets/comonents/menu-items/harta/HartaPage";
import GraphicsPage from "./assets/comonents/menu-items/general/GraphicPage";
import SettingsPage from "./assets/comonents/menu-items/settings/SettingsPage";
import UtaRoot from "./assets/comonents/content/uta/UtaRoot";
import { useAuth } from "./services/AuthProvider";      // ← adaugă
import LoginPage from "../src/pages/LoginPage"; // ← adaugă (calea ta)
import ProfilePage from "./assets/comonents/menu-items/profile/ProfilePage";

export default function AppWrapper() {
  const { token, logout, username } = useAuth();        // ← adaugă
  const [resetTrigger, setResetTrigger] = useState(false);
  const [menuHidden, setMenuHidden] = useState(false);

  // ── dacă nu e autentificat → afișează login ──────────────────────────
  if (!token) {
  return <LoginPage onLogin={() => {}} />;  // ← gol, fără reload
}

  return (
    // ← UtaProvider SCOS de aici, e deja în main.jsx
    <Router>
      <Header menuHidden={menuHidden} setMenuHidden={setMenuHidden} />
      <div className={`main-layout ${menuHidden ? "menu-hidden" : ""}`}>
        <Menu
          menuHidden={menuHidden}
          setMenuHidden={setMenuHidden}
          onNavigate={() => setResetTrigger(prev => !prev)}
        />

        <div className="content">
          <Routes>
            <Route path="/"           element={<HomePage />} />
            <Route path="/homepage"   element={<HomePage />} />
            <Route path="/dashboard/*" element={<Content resetTrigger={resetTrigger} />} />
            <Route path="/uta/*"      element={<Content resetTrigger={resetTrigger} />} />
            <Route path="/chiller/*"  element={<Content resetTrigger={resetTrigger} />} />
            <Route path="/kaldaja/*"  element={<Content resetTrigger={resetTrigger} />} />
            <Route path="/settings/*" element={<UtaRoot />} />
            <Route path="/general"    element={null} />
            <Route path="/profile"    element={<ProfilePage/>} />
            <Route path="/harta/*"    element={<HartaPage />} />
            <Route path="/graphics/*" element={<GraphicsPage />} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}