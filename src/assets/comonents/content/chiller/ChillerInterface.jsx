import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faSave, faTimes, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import TemperatureChart from "../uta/TemperatureChart";
import { initialChillerData } from "../chiller/data/chillersData";
import { initialUtaData } from "../uta/uta data/utaData";
import ChillerCardElement from "./ChillerCardElement";
import "./ChillerInterface.css";
 

// ==== Mapping Chiller -> lista de UTA ID-uri ====
const chillerToUtaMap = initialUtaData.reduce((map, uta) => {
  const chillerId = uta.chiller?.id;
  if (chillerId) {
    if (!map[chillerId]) map[chillerId] = [];
    map[chillerId].push(uta.id);
  }
  return map;
}, {});

export default function ChillerInterface({ onBack }) {
  const [chillerData, setChillerData] = useState(initialChillerData);
  const [selectedChiller, setSelectedChiller] = useState(null);
  const [activeChart, setActiveChart] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedChiller, setEditedChiller] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveEditedChiller = () => {
    console.log("Trimitem la API:", editedChiller);
    setSaveMessage("Parametrat u ruajten me succes!");
    setEditMode(false);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // ==== VIEW DETALII CHILLER SELECTAT ====
  if (selectedChiller) {
    return (
      <div className="chiller-interface main-chiller">
        {saveMessage && (
          <div className="alert-modal">
            <div className="alert-modal-content">
              <strong>{saveMessage}</strong>
            </div>
          </div>
        )}

        <div className="chiller-details-container">
          <div className="chiller-details-header">
            <button
              className="back-btn-chiller"
              onClick={() => {
                setSelectedChiller(null);
                setActiveChart(null);
                setEditMode(false);
              }}
            >
              <FiArrowLeft /> Back
            </button>

            <h2>{selectedChiller.id}</h2>
            <p>
              <strong>Conected:</strong>{" "}
              {chillerToUtaMap[selectedChiller.id]?.join(", ") || "-"}
            </p>

            {/* Status pătrat */}
            <div className="status-wrapper">
              <strong>Status Chiller:</strong>
              <div
                className={`status-box ${
                  selectedChiller.status === "ON" ? "on" : "off"
                }`}
              >
                {selectedChiller.status === "ON" ? "Activ" : "Inactiv"}
              </div>
            </div>
          </div>

          {/* Grid date chiller */}
          <div className="chiller-details-grid">
            <div className="data-card">
              <h4>Temp Ujit Hyrje</h4>
              <p>{selectedChiller.tempIn} °C</p>
            </div>
            <div className="data-card">
              <h4>Temp Ujit Dalje</h4>
              <p>{selectedChiller.tempOut} °C</p>
            </div>
            <div className="data-card">
              <h4>Presioni</h4>
              <p>{selectedChiller.pressure} bar</p>
            </div>
            <div className="data-card">
              <h4>Kaldaja Supply</h4>
              <p>{selectedChiller.kaldaja.tempSupply} °C</p>
            </div>
            <div className="data-card">
              <h4>Kaldaja Return</h4>
              <p>{selectedChiller.kaldaja.tempReturn} °C</p>
            </div>
            <div className="data-card">
              <h4>Inverter Power</h4>
              <p>{selectedChiller.kaldaja.inverter.power} %</p>
            </div>
          </div>

          {/* Chart buttons */}
         

          {activeChart && (
            <div className="chiller-chart">
              <button onClick={() => setActiveChart(null)}>✕ Close</button>
              {activeChart === "water-in" && (
                <TemperatureChart
                  data={[selectedChiller]}
                  dataKey="tempIn"
                  label="Temp Ujit Hyrje"
                />
              )}
              {activeChart === "water-out" && (
                <TemperatureChart
                  data={[selectedChiller]}
                  dataKey="tempOut"
                  label="Temp Ujit Dalje"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==== LISTA CHILLERE ====
  return (
    <div className="chiller-interface">
      <div className="chiller-row header">
        <div className="chiller-cell"><strong>Chiller ID</strong></div>
        <div className="chiller-cell"><strong>Status</strong></div>
        <div className="chiller-cell"><strong>Temp in</strong></div>
        <div className="chiller-cell"><strong>Temp out</strong></div>
        <div className="chiller-cell"><strong>UTA conected</strong></div>
      </div>

      {chillerData.map((chiller) => (
        <ChillerCardElement
          key={chiller.id}
          chiller={chiller}
          utas={chillerToUtaMap[chiller.id]?.map((utaId) =>
            initialUtaData.find((u) => u.id === utaId)
          ) || []}
          onClick={() => setSelectedChiller(chiller)}
        />
      ))}

     <button className="back-button" onClick={onBack}>
             <span className="back-icon"><FiArrowLeft /></span>
             Back
           </button>
    </div>
  );
}