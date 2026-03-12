import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import "./UtaInterface.css";
import UtaCardElement from "./UtaCardElement";

export default function UtaInterface({ onBack }) {

    const utaData = [
        { id: "UTA 1234", tempAirSupply: 22, tempReturn: 19, tempWaterIn: 30, pressure: 1.2, inverterAirSupply: 80, inverterAirReturn: 75 },
        { id: "UTA 4567", tempAirSupply: 23, tempReturn: 20, tempWaterIn: 31, pressure: 1.1, inverterAirSupply: 70, inverterAirReturn: 68 },
        { id: "UTA 8910", tempAirSupply: 21, tempReturn: 19, tempWaterIn: 29, pressure: 1.3, inverterAirSupply: 85, inverterAirReturn: 80 },
        { id: "UTA 8911", tempAirSupply: 21, tempReturn: 19, tempWaterIn: 29, pressure: 1.3, inverterAirSupply: 85, inverterAirReturn: 80 },
    ];


    const handleStart = (id) => alert(`${id} START pressed`);
    const handleStop = (id) => alert(`${id} STOP pressed`);

    return (
        <div className="uta-interface">


            <div className="uta-row header">
                <div className="uta-cell">UTA ID</div>
                <div className="uta-cell">(°C) dërgim</div>
                <div className="uta-cell">(°C) Kthim</div>
                <div className="uta-cell">(°C) Ujit në Hyrje</div>
                <div className="uta-cell">Psi në Dërgim</div>
                <div className="uta-cell">Inv Ajri Dërgim</div>
                <div className="uta-cell">Inv Ajri Kthim</div>
                <div className="uta-cell">Start</div>
                <div className="uta-cell">Stop</div>
            </div>

            {/* DATA ROWS */}
            {utaData.map((uta) => (
                <UtaCardElement
                    key={uta.id}
                    {...uta}
                    onStart={() => handleStart(uta.id)}
                    onStop={() => handleStop(uta.id)}
                />
            ))}

            <button className="back-button" onClick={onBack}>
                <span className="back-icon"><FiArrowLeft /></span>
                Back
            </button>
        </div>
    );
}