import React from "react";
import "./UtaCardElement.css";
import { FiPlay, FiSquare } from "react-icons/fi";
import { FiEye } from "react-icons/fi";

export default function UtaCardElement({
  id,
  status,
  tempAirSupply,
  tempReturn,
  pressure,
  inverterAirSupply,
  inverterAirReturn,
  chiller,
  onStart,
  onStop,
  onClick
}) {
  return (
    <div className="uta-row" onClick={onClick}>
      <div className="uta-cell uta-id">
        {id}
        <span className={`status ${status.toLowerCase()}`}>{status}</span>


        <FiEye
          className="view-icon"
          onClick={() => onClick()}
          title="View details"
        />
      </div>
      <div className="uta-cell">{tempAirSupply}°C</div>
      <div className="uta-cell">{tempReturn}°C</div>
      <div className="uta-cell">{chiller?.tempIn ?? "-"}°C</div>    {/* Water In from Chiller */}
      {/* <div className="uta-cell">{chiller?.tempOut ?? "-"}°C</div>   Water Out from Chiller */}
      <div className="uta-cell">{pressure} bar</div>
      <div className="uta-cell">{inverterAirSupply}%</div>
      <div className="uta-cell">{inverterAirReturn}%</div>
      <div className="uta-cell">
        <button
          className="uta-button start"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          Start
        </button>
      </div>
      <div className="uta-cell">
        <button
          className="uta-button stop"
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
        >
          Stop
        </button>
      </div>
    </div>
  );
}