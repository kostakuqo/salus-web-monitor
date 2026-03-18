import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import "./UtaInterface.css";
import UtaCardElement from "./UtaCardElement";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TemperatureChart from "./TemperatureChart";
import { faGear, faSave, faTimes, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { initialUtaData } from "./uta data/utaData";

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
    console.log("Trimitem la API:", editedUta);
    setSaveMessage("Parametrat u ruajten me sukses!");
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
            <button
              className="back-btn"
              onClick={() => {
                setSelectedUta(null);
                setActiveChart(null);
                setEditMode(false);
              }}
            >
              <span className="back-icon"><FiArrowLeft /></span>
              Back
            </button>

            <h2>{selectedUta.id}</h2>
            <span className={`status-tag ${selectedUta.status.toLowerCase()}`}>{selectedUta.status}</span>

            <div className="uta-actions">
              <button className="uta-button start" onClick={() => handleStart(selectedUta.id)}><FontAwesomeIcon icon={faPlay} />Start</button>
              <button className="uta-button stop" onClick={() => handleStop(selectedUta.id)}><FontAwesomeIcon icon={faStop} />Stop</button>
              <button className="uta-button edit" onClick={() => { setEditedUta({ ...selectedUta }); setEditMode(true); }}>
                <FontAwesomeIcon icon={faGear} style={{ marginRight: '6px' }} />
                Modifiko Parametrat
              </button>
            </div>
          </div>

          {/* FORM EDIT */}
          {editMode && editedUta && (
            <div className="edit-form">
              <h3>Modifiko Parametrat</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEditedUta(); }}>
                <label>
                  Temperatura ajrit Hyrje:
                  <input type="number" value={editedUta.tempAirSupply} onChange={(e) => setEditedUta({ ...editedUta, tempAirSupply: Number(e.target.value) })} />
                </label>
                <label>
                  Temperatura e ajrit Kthim:
                  <input type="number" value={editedUta.tempReturn} onChange={(e) => setEditedUta({ ...editedUta, tempReturn: Number(e.target.value) })} />
                </label>
                <label>
                  Temp Chill Ujit Hyrje:
                  <input type="number" value={editedUta.chiller.tempIn} onChange={(e) => setEditedUta({ ...editedUta, chiller: { ...editedUta.chiller, tempIn: Number(e.target.value) } })} />
                </label>
                {/* <label>
                  Temp Chill Ujit Dalje:
                  <input type="number" value={editedUta.chiller.tempOut} onChange={(e) => setEditedUta({ ...editedUta, chiller: { ...editedUta.chiller, tempOut: Number(e.target.value) } })} />
                </label> */}
                <label>
                  Presioni:
                  <input type="number" step="0.1" value={editedUta.pressure} onChange={(e) => setEditedUta({ ...editedUta, pressure: Number(e.target.value) })} />
                </label>
                <label>
                  Inverter Hyrje:
                  <input type="number" value={editedUta.inverterAirSupply} onChange={(e) => setEditedUta({ ...editedUta, inverterAirSupply: Number(e.target.value) })} />
                </label>
                <label>
                  Inverter Kthim:
                  <input type="number" value={editedUta.inverterAirReturn} onChange={(e) => setEditedUta({ ...editedUta, inverterAirReturn: Number(e.target.value) })} />
                </label>
                <div className="form-actions">
                  <button type="submit" className="save-data"><FontAwesomeIcon icon={faSave} />Save</button>
                  <button type="button" className="cancel-data" onClick={() => setEditMode(false)}><FontAwesomeIcon icon={faTimes} />Anullo</button>
                </div>
              </form>
            </div>
          )}

          {/* DATA GRID */}
          <div className="uta-details-grid">
            <div className="data-card"><h4>Temp Air Hyrje</h4><p>{selectedUta.tempAirSupply} °C</p></div>
            <div className="data-card"><h4>Temp Air Kthim</h4><p>{selectedUta.tempReturn} °C</p></div>
            <div className="data-card"><h4>Temp Ujit Hyrje chiller</h4><p>{selectedUta.chiller.tempIn} °C</p></div>
            {/* <div className="data-card"><h4>Temp Ujit Dalje chiller</h4><p>{selectedUta.chiller.tempOut} °C</p></div> */}
            <div className="data-card"><h4>Presioni ne dergim</h4><p>{selectedUta.pressure} bar</p></div>
            <div className="data-card"><h4>Inverter Hyrje</h4><p>{selectedUta.inverterAirSupply}%</p></div>
            <div className="data-card"><h4>Inverter Kthim</h4><p>{selectedUta.inverterAirReturn}%</p></div>
          </div>

          {/* CHART BUTTONS */}
          <div className="uta-charts-buttons">
            <button className={`chart-btn ${activeChart === "supply" ? "active" : ""}`} onClick={() => setActiveChart("supply")}>
              <GoGraph style={{ marginRight: "4px", fontSize: "15px" }} />Temp Air Hyrje
            </button>
            <button className={`chart-btn ${activeChart === "return" ? "active" : ""}`} onClick={() => setActiveChart("return")}>
              <GoGraph style={{ marginRight: "4px" }} />Temp Air Kthim
            </button>
            <button className={`chart-btn ${activeChart === "water-in" ? "active" : ""}`} onClick={() => setActiveChart("water-in")}>
              <GoGraph style={{ marginRight: "4px" }} />Temp Ujit Hyrje
            </button>
            <button className={`chart-btn ${activeChart === "water-out" ? "active" : ""}`} onClick={() => setActiveChart("water-out")}>
              <GoGraph style={{ marginRight: "4px" }} />Temp Ujit Dalje
            </button>
          </div>

          {/* GRAFICE */}
          <div className="uta-chart">
            {activeChart && (
              <div className="chart-wrapper">
                <button className="chart-close-btn" onClick={() => setActiveChart(null)}>✕ Close</button>

                {activeChart === "supply" && (
                  <TemperatureChart data={[selectedUta]} dataKey="tempAirSupply" label="Temp Air Hyrje" />
                )}
                {activeChart === "return" && (
                  <TemperatureChart data={[selectedUta]} dataKey="tempReturn" label="Temp Air Kthim" />
                )}
                {activeChart === "water-in" && (
                  <TemperatureChart data={[selectedUta.chiller]} dataKey="tempIn" label="Temp Ujit Hyrje" />
                )}
                {activeChart === "water-out" && (
                  <TemperatureChart data={[selectedUta.chiller]} dataKey="tempOut" label="Temp Ujit Dalje" />
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
        <div className="uta-cell"><strong>(°C) ajrit dërgim</strong></div>
        <div className="uta-cell"><strong>(°C) ajrit Kthim</strong></div>
        <div className="uta-cell"><strong>(°C) Ujit_In_chiller</strong></div>
        {/* <div className="uta-cell"><strong>(°C) Ujit_out_chiller</strong></div> */}
        <div className="uta-cell"><strong>Psi dergim</strong></div>
        <div className="uta-cell"><strong>Inv In</strong></div>
        <div className="uta-cell"><strong>Inv Ret</strong></div>
        <div className="uta-cell"><strong>Start</strong></div>
        <div className="uta-cell"><strong>Stop</strong></div>
      </div>

      {utaData.map((uta) => (
        <UtaCardElement
          key={uta.id}
          {...uta}
          chiller={uta.chiller}
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