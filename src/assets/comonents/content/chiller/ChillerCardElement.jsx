import React from "react";

export default function ChillerCardElement({ chiller, utas, onClick }) {
  return (
    <div className="chiller-row" onClick={onClick}>
      {/* Chiller ID */}
      <div className="chiller-cell chiller-id">{chiller.id}</div>

      {/* Chiller Status */}
      <div className={`status ${chiller.status === "ON" ? "on" : "off"} chiller-cell`}>
        {chiller.status === "ON" ? "Activ" : "Inactiv"}
      </div>

      {/* Temp In */}
      <div className="chiller-cell">{chiller.tempIn} °C</div>

      {/* Temp Out */}
      <div className="chiller-cell">{chiller.tempOut} °C</div>

      {/* UTA conectate (doar ID-uri) */}
      <div className="chiller-cell">
        {utas.map((uta) => uta.id).join(", ") || "-"}
      </div>
    </div>
  );
}