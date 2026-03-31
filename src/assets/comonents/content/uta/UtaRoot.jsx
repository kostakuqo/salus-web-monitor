// UtaRoot.jsx
// ─────────────────────────────────────────────────────────────
//  PARENT care deține state-ul shared.
//  UtaInterface  ─┐
//                 ├── citesc/scriu același utaData + setUtaData
//  UtaSettingsPage─┘
// ─────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { initialUtaData } from "./uta data/utaData";
import UtaInterface from "./UtaInterface";
import UtaSettingsPage from "./UtaSettingsPage";
import Settings from "../../menu-items/settings/Settings";

export default function UtaRoot({ onBack }) {
  // ── SINGLE SOURCE OF TRUTH ──────────────────────────────────
  const [utaData, setUtaData] = useState(initialUtaData);
  const [activePage, setActivePage] = useState("interface"); // "interface" | "settings"

  // ── HANDLERS condivisi ──────────────────────────────────────
  const handleStart = (id) => {
    setUtaData(prev =>
      prev.map(u => u.id === id ? { ...u, status: "ON" } : u)
    );
  };

  const handleStop = (id) => {
    setUtaData(prev =>
      prev.map(u => u.id === id ? { ...u, status: "OFF" } : u)
    );
  };

  /**
   * onSave primește { utaId, Air_inp_Temp, Air_Return_Temp, ... }
   * și face merge în array.
   */
  const handleSave = ({ utaId, ...fields }) => {
    setUtaData(prev =>
      prev.map(u => u.id === utaId ? { ...u, ...fields } : u)
    );
  };

  // ── RENDER ──────────────────────────────────────────────────
  if (activePage === "settings") {
    return (
      <UtaSettingsPage
        utaData={utaData}
        onBack={() => setActivePage("interface")}
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
      onBack={onBack}
      onStart={handleStart}
      onStop={handleStop}
      onSave={handleSave}
      onOpenSettings={() => setActivePage("settings")}
    />
  );
}