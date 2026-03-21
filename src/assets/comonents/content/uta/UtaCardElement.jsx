import React from "react";
import "./UtaCardElement.css";
import { FiPlay, FiSquare } from "react-icons/fi";
import { FiEye } from "react-icons/fi";

export default function UtaCardElement({
    id,
    status ,
    Sezon_Modality,
    Air_inp_Temp,
    Air_Output_Temp,
    Air_Return_Temp,
    Water_InpChillTemp,
    Water_outChill_Temp,
    Water_InpBoilTemp,
    Water_OutputBoilTemp,
    Boil_Pump_Invert,
    Chiller_Pump_Invert,
    Boil_Valve,
    Chiller_Valve,
    Inp_Damper, 
    Output_Damper,
    Out_Return_Pressure,
    Air_outHygro,
    Ventilator,
    Aspirator,
    Power_Status,
    onClick,
    onStart,
    onStop
}) {
  return (
    <div className="uta-row" onClick={onClick}>
      <div className="uta-cell uta-id">
        {id}
        <span className={`status ${status.toLowerCase()}`}>
          {status}
        </span>

        <FiEye
          className="view-icon"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          title="View details"
        />
      </div>

      <div className="uta-cell">{Air_inp_Temp}°C</div>
      <div className="uta-cell">{Air_Return_Temp}°C</div>
      <div className="uta-cell">{Water_InpChillTemp}°C</div>
      <div className="uta-cell">{Out_Return_Pressure} bar</div>
     

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