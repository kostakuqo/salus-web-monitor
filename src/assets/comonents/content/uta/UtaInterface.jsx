import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import "./UtaInterface.css";
import UtaCardElement from "./UtaCardElement";
import TemperatureChart from "./TemperatureChart";

export default function UtaInterface({ onBack }) {

    const utaData = [
        {
            id: "UTA 1234",
            status: "ON",
            tempAirSupply: 22,
            tempReturn: 19,
            tempWaterIn: 30,
            pressure: 1.2,
            inverterAirSupply: 80,
            inverterAirReturn: 75
        },
        {
            id: "UTA 4567",
            status: "OFF",
            tempAirSupply: 23,
            tempReturn: 20,
            tempWaterIn: 31,
            pressure: 1.1,
            inverterAirSupply: 70,
            inverterAirReturn: 68
        },
        {
            id: "UTA 8910",
            status: "ON",
            tempAirSupply: 21,
            tempReturn: 19,
            tempWaterIn: 29,
            pressure: 1.3,
            inverterAirSupply: 85,
            inverterAirReturn: 80
        }
    ];

    const handleStart = (id) => alert(`${id} START pressed`);
    const handleStop = (id) => alert(`${id} STOP pressed`);

    const [selectedUta, setSelectedUta] = useState(null);
    const [activeChart, setActiveChart] = useState(null);

    if (selectedUta) {
        return (
            <div className="uta-interface main-uta">

                <div className="uta-details-container">

                    <div className="uta-details-header">

                        <button
                            className="back-btn"
                            onClick={() => {
                                setSelectedUta(null);
                                setActiveChart(null);
                            }}
                        >
                            <span className="back-icon"><FiArrowLeft /></span>
                            Back
                        </button>

                        <h2>{selectedUta.id}</h2>

                        <span className={`status-tag ${selectedUta.status.toLowerCase()}`}>
                            {selectedUta.status}
                        </span>

                        <div className="uta-actions">
                            <button
                                className="uta-button start"
                                onClick={() => handleStart(selectedUta.id)}
                            >
                                Start
                            </button>

                            <button
                                className="uta-button stop"
                                onClick={() => handleStop(selectedUta.id)}
                            >
                                Stop
                            </button>
                        </div>

                    </div>

                    {/* DATA GRID */}
                    <div className="uta-details-grid">
                        <div className="data-card">
                            <h4>Temp Air Hyrje</h4>
                            <p>{selectedUta.tempAirSupply} °C</p>
                        </div>
                        <div className="data-card">
                            <h4>Temp Air Kthim</h4>
                            <p>{selectedUta.tempReturn} °C</p>
                        </div>
                        <div className="data-card">
                            <h4>Temp Ujit Hyrje</h4>
                            <p>{selectedUta.tempWaterIn} °C</p>
                        </div>
                        <div className="data-card">
                            <h4>Presioni</h4>
                            <p>{selectedUta.pressure} bar</p>
                        </div>
                        <div className="data-card">
                            <h4>Inverter Hyrje</h4>
                            <p>{selectedUta.inverterAirSupply}%</p>
                        </div>
                        <div className="data-card">
                            <h4>Inverter Kthim</h4>
                            <p>{selectedUta.inverterAirReturn}%</p>
                        </div>
                    </div>

                    {/* CHART BUTTONS */}
                    {/* CHART BUTTONS */}
                    <div className="uta-charts-buttons">
                        <button
                            className={`chart-btn ${activeChart === "supply" ? "active" : ""}`}
                            onClick={() => setActiveChart("supply")}
                        >
                            <GoGraph style={{ marginRight: "4px", fontSize: "15px", fontWeight: "bolder" }} /> {/* iconița */}
                            Temp Air Hyrje
                        </button>
                        <button
                            className={`chart-btn ${activeChart === "return" ? "active" : ""}`}
                            onClick={() => setActiveChart("return")}
                        >
                            <GoGraph style={{ marginRight: "4px" }} /> {/* iconița */}
                            Temp Air Kthim
                        </button>
                        <button
                            className={`chart-btn ${activeChart === "water" ? "active" : ""}`}
                            onClick={() => setActiveChart("water")}
                        >
                            <GoGraph style={{ marginRight: "4px" }} /> {/* iconița */}
                            Temp Ujit
                        </button>
                    </div>

                    {/* CHART AREA */}
                    <div className="uta-chart">
                        {activeChart && (
                            <div className="chart-wrapper">
                                {/* BUTON DE ÎNCHIDERE ÎN COLȚ */}
                                <button className="chart-close-btn" onClick={() => setActiveChart(null)}>
                                    ✕ Close
                                </button>

                                {activeChart === "supply" && (
                                    <TemperatureChart
                                        data={[selectedUta]}
                                        dataKey="tempAirSupply"
                                        label="Temp Air Hyrje"
                                    />
                                )}

                                {activeChart === "return" && (
                                    <TemperatureChart
                                        data={[selectedUta]}
                                        dataKey="tempReturn"
                                        label="Temp Air Kthim"
                                    />
                                )}

                                {activeChart === "water" && (
                                    <TemperatureChart
                                        data={[selectedUta]}
                                        dataKey="tempWaterIn"
                                        label="Temp Ujit Hyrje"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="uta-interface">
            <div className="uta-row header">
                <div className="uta-cell"><strong>UTA ID</strong></div>
                <div className="uta-cell"><strong>(°C) dërgim</strong></div>
                <div className="uta-cell"><strong>(°C) Kthim</strong></div>
                <div className="uta-cell"><strong>(°C) Ujit_In</strong></div>
                <div className="uta-cell"><strong>Psi In</strong></div>
                <div className="uta-cell"><strong>Inv In</strong></div>
                <div className="uta-cell"><strong>Inv Ret</strong></div>
                <div className="uta-cell"><strong>Start</strong></div>
                <div className="uta-cell"><strong>Stop</strong></div>
            </div>

            {utaData.map((uta) => (
                <UtaCardElement
                    key={uta.id}
                    {...uta}
                    onClick={() => setSelectedUta(uta)}
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