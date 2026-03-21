import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import "./UtaInterface.css";
import UtaCardElement from "./UtaCardElement";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TemperatureChart from "./TemperatureChart";
import { faGear, faSave, faTimes, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { initialUtaData } from "./uta data/utaData";

// Câmpurile exacte din form — doar acestea vor fi loguite
const FORM_FIELDS = [
  "Air_inp_Temp",
  "Air_Return_Temp",
  "Water_InpChillTemp",
  "Out_Return_Pressure",
];

export default function UtaInterface({ onBack }) {
  const [utaData, setUtaData] = useState(initialUtaData);
  const [selectedUta, setSelectedUta] = useState(null);
  const [activeChart, setActiveChart] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUta, setEditedUta] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const handleStart = (id) => alert(`${id} START pressed`);
  const handleStop = (id) => alert(`${id} STOP pressed`);

  const handleSaveEditedUta = () => {
    // Construim un obiect cu DOAR câmpurile completate în form
    const formValues = FORM_FIELDS.reduce((acc, field) => {
      acc[field] = editedUta[field];
      return acc;
    }, {});

    // Adăugăm ID-ul UTA-ului pentru context
    const logData = {
      utaId: editedUta.id,
      ...formValues,
    };

    console.log("Date completate în form:", logData);

    setSaveMessage("Datele au fost afișate în consolă!");
    setEditMode(false);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  if (selectedUta) {
    return (
      <div className="uta-interface main-uta">

        {saveMessage && (
          <div className="alert-modal">
            <div className="alert-modal-content">
              <strong>{saveMessage}</strong>
            </div>
          </div>
        )}

        <div className="uta-details-container">

          <div className="uta-details-header">
            <button className="back-btn" onClick={() => {
              setSelectedUta(null);
              setActiveChart(null);
              setEditMode(false);
            }}>
              <span className="back-icon"><FiArrowLeft /></span>
              Back
            </button>

            <h2>{selectedUta.id}</h2>

            <span className={`status-tag ${selectedUta.status.toLowerCase()}`}>
              {selectedUta.status}
            </span>

            <div className="uta-actions">
              <button className="uta-button start" onClick={() => handleStart(selectedUta.id)}>
                <FontAwesomeIcon icon={faPlay} />Start
              </button>

              <button className="uta-button stop" onClick={() => handleStop(selectedUta.id)}>
                <FontAwesomeIcon icon={faStop} />Stop
              </button>

              <button className="uta-button edit" onClick={() => {
                setEditedUta({ ...selectedUta });
                setEditMode(true);
              }}>
                <FontAwesomeIcon icon={faGear} style={{ marginRight: '6px' }} />
                Modifiko Parametrat
              </button>
            </div>
          </div>

          {/* EDIT FORM */}
          {editMode && editedUta && (
            <div className="edit-form">
              <h3>Modifiko Parametrat</h3>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveEditedUta(); }}>

                <label>
                  Temp Air In:
                  <input type="number"
                    value={editedUta.Air_inp_Temp}
                    onChange={(e) => setEditedUta({ ...editedUta, Air_inp_Temp: +e.target.value })}
                  />
                </label>

                <label>
                  Temp Air Return:
                  <input type="number"
                    value={editedUta.Air_Return_Temp}
                    onChange={(e) => setEditedUta({ ...editedUta, Air_Return_Temp: +e.target.value })}
                  />
                </label>

                <label>
                  Water Chill In:
                  <input type="number"
                    value={editedUta.Water_InpChillTemp}
                    onChange={(e) => setEditedUta({ ...editedUta, Water_InpChillTemp: +e.target.value })}
                  />
                </label>

                <label>
                  Presioni:
                  <input type="number" step="0.1"
                    value={editedUta.Out_Return_Pressure}
                    onChange={(e) => setEditedUta({ ...editedUta, Out_Return_Pressure: +e.target.value })}
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" className="save-data">
                    <FontAwesomeIcon icon={faSave} />Save
                  </button>

                  <button type="button" className="cancel-data" onClick={() => setEditMode(false)}>
                    <FontAwesomeIcon icon={faTimes} />Anullo
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* DATA GRID FULL */}
          <div className="uta-details-grid">
            <div className="data-card"><h4>Temperatura ambjentale</h4><p>{selectedUta.Air_inp_Temp} °C</p></div>
            <div className="data-card"><h4>Temperatur ne dergim</h4><p>{selectedUta.Air_Output_Temp} °C</p></div>
            <div className="data-card"><h4>Temperatura ne kthim</h4><p>{selectedUta.Air_Return_Temp} °C</p></div>
            <div className="data-card"><h4>Lageshtira</h4><p>{selectedUta.Air_outHygro} %</p></div>
            <div className="data-card"><h4>Temperatura ujit ne hyrje Chillerit</h4><p>{selectedUta.Water_InpChillTemp} °C</p></div>
            <div className="data-card"><h4>Temperatura ujit ne dalje Chillerit</h4><p>{selectedUta.Water_outChill_Temp} °C</p></div>
            <div className="data-card"><h4>Temperatura ujit ne hyrje Kaldaja</h4><p>{selectedUta.Water_InpBoilTemp} °C</p></div>
            <div className="data-card"><h4>Temperatura ujit ne dalje Kaldaja</h4><p>{selectedUta.Water_OutputBoilTemp} °C</p></div>
            <div className="data-card"><h4>Pompa E kaldajes</h4><p>{selectedUta.Boil_Pump_Invert} %</p></div>
            <div className="data-card"><h4>Pompa E Chillerit</h4><p>{selectedUta.Chiller_Pump_Invert} %</p></div>
            <div className="data-card"><h4>Valvula e kaldajes</h4><p>{selectedUta.Boil_Valve} %</p></div>
            <div className="data-card"><h4>Valvula e Chillerit</h4><p>{selectedUta.Chiller_Valve} %</p></div>
            <div className="data-card"><h4>Damper Hyrje</h4><p>{selectedUta.Inp_Damper} %</p></div>
            <div className="data-card"><h4>Damper Dalje</h4><p>{selectedUta.Output_Damper} %</p></div>
            <div className="data-card"><h4>Aspirator</h4><p>{selectedUta.Aspirator} %</p></div>
            <div className="data-card"><h4>Ventilator</h4><p>{selectedUta.Ventilator} %</p></div>
            <div className="data-card">
              <h4>Pressure</h4>
              <p className="pressure">{selectedUta.Out_Return_Pressure} bar</p>
            </div>
            <div className="data-card">
              <h4>Mode</h4>
              <p className={selectedUta.Sezon_Modality === "HEATING" ? "mode-heat" : "mode-cool"}>
                {selectedUta.Sezon_Modality}
              </p>
            </div>
          </div>

          {/* CHARTS */}
          <div className="uta-charts-buttons">
            <button className={`chart-btn ${activeChart === "supply" ? "active" : ""}`} onClick={() => setActiveChart("supply")}>
              <GoGraph /> Temp Air In
            </button>
            <button className={`chart-btn ${activeChart === "return" ? "active" : ""}`} onClick={() => setActiveChart("return")}>
              <GoGraph /> Temp Return
            </button>
            <button className={`chart-btn ${activeChart === "water" ? "active" : ""}`} onClick={() => setActiveChart("water")}>
              <GoGraph /> Temp Water
            </button>
          </div>

          <div className="uta-chart">
            {activeChart && (
              <div className="chart-wrapper">
                <button className="chart-close-btn" onClick={() => setActiveChart(null)}>✕ Close</button>
                {activeChart === "supply" && (
                  <TemperatureChart data={[selectedUta]} dataKey="Air_inp_Temp" />
                )}
                {activeChart === "return" && (
                  <TemperatureChart data={[selectedUta]} dataKey="Air_Return_Temp" />
                )}
                {activeChart === "water" && (
                  <TemperatureChart data={[selectedUta]} dataKey="Water_InpChillTemp" />
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
        <div className="uta-cell"><strong>Air In</strong></div>
        <div className="uta-cell"><strong>Air Return</strong></div>
        <div className="uta-cell"><strong>Water In</strong></div>
        <div className="uta-cell"><strong>Pressure</strong></div>
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