import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import UtaInterface from "./UtaInterface";
import SettingsPage from "../../menu-items/settings/SettingsPage";
import{useUta} from "../../../../services/UtaProvider"

export default function UtaRoot({ onBack }) {
  const navigate = useNavigate(); 
  const { utas: utaData, setUtas: setUtaData } = useUta(); // folosește contextul
  const [activePage, setActivePage] = React.useState("settings"); // start cu interface

  // ── HANDLERE START/STOP/SAVE ──────────────────────────
  const handleStart = useCallback((id) => {
    setUtaData(prev =>
      prev.map(u => u.id === id ? { ...u, status: "ON" } : u)
    );
  }, [setUtaData]);

  const handleStop = useCallback((id) => {
    setUtaData(prev =>
      prev.map(u => u.id === id ? { ...u, status: "OFF" } : u)
    );
  }, [setUtaData]);

  const handleSave = useCallback(({ utaId, ...fields }) => {
    setUtaData(prev =>
      prev.map(u => u.id === utaId ? { ...u, ...fields } : u)
    );
  }, [setUtaData]);

  // ── PAGINI ────────────────────────────────────────────
  const handleOpenSettings = useCallback(() => setActivePage("settings"), []);
  const handleBackFromSettings = useCallback(() => setActivePage("interface"), []);
  const handleBackFromInterface = useCallback(() => {
    if (onBack) onBack(); else navigate(-1);
  }, [onBack, navigate]);

  if (activePage === "settings") {
    return (
      <SettingsPage
        utaData={utaData}
        onBack={handleBackFromSettings}
        onStart={handleStart}
        onStop={handleStop}
        onSave={handleSave}
      />
    );
  }

  return (
    <UtaInterface
      utaData={utaData}
      setUtaData={setUtaData}
      onBack={handleBackFromInterface}
      onStart={handleStart}
      onStop={handleStop}
      onSave={handleSave}
      onOpenSettings={handleOpenSettings}
    />
  );
}