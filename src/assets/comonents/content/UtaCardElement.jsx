import React from "react";
import "./UtaCardElement.css";
import { FiPlay, FiSquare } from "react-icons/fi";

export default function UtaCardElement({
  id,
  tempAirSupply,
  tempReturn,
  tempWaterIn,
  pressure,
  inverterAirSupply,
  inverterAirReturn,
  onStart,
  onStop
}) {
  return (
    <div className="uta-row">
      <div className="uta-cell">{id}</div>
      <div className="uta-cell">{tempAirSupply}°C</div>
      <div className="uta-cell">{tempReturn}°C</div>
      <div className="uta-cell">{tempWaterIn}°C</div>
      <div className="uta-cell">{pressure} bar</div>
      <div className="uta-cell">{inverterAirSupply}%</div>
      <div className="uta-cell">{inverterAirReturn}%</div>
      <div className="uta-cell">
        <button className="uta-button start" onClick={onStart}>Start</button>
      </div>
      <div className="uta-cell">
        <button className="uta-button stop" onClick={onStop}>Stop</button>
      </div>
    </div>
  );
}