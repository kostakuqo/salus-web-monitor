
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { initialUtaData } from "./uta data/utaData";
import UtaInterface from "./UtaInterface";
import SettingsPage from "../../menu-items/settings/SettingsPage";

export default function UtaRoot({ onBack }) {
  const navigate = useNavigate(); 
  const [utaData, setUtaData] = useState(initialUtaData);
  const [activePage, setActivePage] = useState("settings");

  const handleStart = useCallback((id) => {
    setUtaData(prev =>
      prev.map(u => u.id === id ? { ...u, status: "ON" } : u)
    );
  }, []);

  const handleStop = useCallback((id) => {
    setUtaData(prev =>
      prev.map(u => u.id === id ? { ...u, status: "OFF" } : u)
    );
  }, []);

const handleSave = useCallback(({ utaId, ...fields }) => {
  console.log("📦 SAVE payload:", { utaId, ...fields });
  setUtaData(prev =>
    prev.map(u => u.id === utaId ? { ...u, ...fields } : u)
  );
}, []);

  const handleOpenSettings = useCallback(() => {
    setActivePage("settings");
  }, []);

  const handleBackFromSettings = useCallback(() => {
    setActivePage("interface");
  }, []);


  const handleBackFromInterface = useCallback(() => {
    if (onBack) {
      onBack(); 
    } else {
      navigate(-1); 
    }
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