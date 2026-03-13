import React from "react";
import "./Kaldaja.css";

export default function Kaldaja({ onClick }) {
  return (
    <div className="kaldaja" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="content-kaldaja">Kaldaja
        <button className="kaldaja-details">Shiko Parametrat</button>
      </div>
    </div>
  );
}