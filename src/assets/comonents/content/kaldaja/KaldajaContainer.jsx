import React from "react";
import Kaldaja from "./Kaldaja";
import KaldajaDescription from "./KaldajaDescription";
import "./KaldajaContainer.css";

export default function KaldajaContainer({ onKaldajaClick }) {
  return (
    <div className="kaldaja-container">
      <Kaldaja onClick={onKaldajaClick} />
      <div className="connector-line" />
      <KaldajaDescription />
    </div>
  );
}