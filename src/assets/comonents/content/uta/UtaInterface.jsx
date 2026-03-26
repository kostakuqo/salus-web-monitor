import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import "./UtaInterface.css";
import UtaCardElement from "./UtaCardElement";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TemperatureChart from "./TemperatureChart";
import { faGear, faSave, faTimes, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { initialUtaData } from "./uta data/utaData";
const FORM_FIELDS = ["Air_inp_Temp", "Air_Return_Temp", "Water_InpChillTemp", "Out_Return_Pressure"];

const FIELD_LABELS = {
  Air_inp_Temp: { label: "Temperatura Air In", unit: "°C" },
  Air_Output_Temp: { label: "Temperatura Air Out", unit: "°C" },
  Air_Return_Temp: { label: "Temperatura Air Return", unit: "°C" },
  Air_outHygro: { label: "Lageshtira", unit: "%" },
  Water_InpChillTemp: { label: "Temperatura Uj Hyrje Chiller", unit: "°C" },
  Water_outChill_Temp: { label: "Temperatura Uj Dalje Chiller", unit: "°C" },
  Water_InpBoilTemp: { label: "Temperatura Uj Hyrje Kaldaja", unit: "°C" },
  Water_OutputBoilTemp: { label: "Temperatura Uj Dalje Kaldaja", unit: "°C" },
  Boil_Pump_Invert: { label: "Pompa Kaldaja", unit: "%" },
  Chiller_Pump_Invert: { label: "Pompa Chiller", unit: "%" },
  Boil_Valve: { label: "Valvula Kaldaja", unit: "%" },
  Chiller_Valve: { label: "Valvula Chiller", unit: "%" },
  Inp_Damper: { label: "Damper Hyrje", unit: "%" },
  Output_Damper: { label: "Damper Dalje", unit: "%" },
  Aspirator: { label: "Aspirator", unit: "%" },
  Ventilator: { label: "Ventilator", unit: "%" },
  Out_Return_Pressure: { label: "Presioni", unit: "bar" },
  Sezon_Modality: { label: "Sezon", unit: "" },
  status: { label: "Status", unit: "" },
  id: { label: "UTA ID", unit: "" },
};

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
    const formValues = FORM_FIELDS.reduce((acc, field) => {
      acc[field] = editedUta[field];
      return acc;
    }, {});
    console.log("Date completate în form:", { utaId: editedUta.id, ...formValues });

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

          {/* HEADER */}
          <div className="uta-details-header">
            <button className="back-btn" onClick={() => {
              setSelectedUta(null);
              setActiveChart(null);
              setEditMode(false);
            }}>
              <FiArrowLeft /> Back
            </button>

            <h2>{selectedUta.id}</h2>
            <span className={`status-tag ${selectedUta.status.toLowerCase()}`}>
              {selectedUta.status}
            </span>

            <div className="uta-actions">
              <button className="uta-button start" onClick={() => handleStart(selectedUta.id)}>
                <FontAwesomeIcon icon={faPlay} /> Start
              </button>
              <button className="uta-button stop" onClick={() => handleStop(selectedUta.id)}>
                <FontAwesomeIcon icon={faStop} /> Stop
              </button>
              <button className="uta-button edit" onClick={() => {
                setEditedUta({ ...selectedUta });
                setEditMode(true);
              }}>
                <FontAwesomeIcon icon={faGear} /> Modifiko Parametrat
              </button>
            </div>
          </div>

          {/* FORM */}
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
                    <FontAwesomeIcon icon={faSave} /> Save
                  </button>
                  <button type="button" className="cancel-data" onClick={() => setEditMode(false)}>
                    <FontAwesomeIcon icon={faTimes} /> Anullo
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GRID */}
          <div className="uta-details-grid">
            {Object.entries(selectedUta).map(([key, val]) => {
              if (!FIELD_LABELS[key]) return null;
              const { label, unit } = FIELD_LABELS[key];
              return (
                <div key={key} className="data-card">
                  <h4>{label}</h4>
                  <p>{val}{unit && ` ${unit}`}</p>
                </div>
              );
            })}
          </div>

          {/* BUTTON GRAPH */}
          <button
            className="uta-button graph-bottom"
            onClick={() => setActiveChart(prev => prev ? null : "main")}
          >
            <GoGraph style={{ marginRight: "6px" }} /> Shiko Grafiket
          </button>

          {/* CHART */}
          {activeChart === "main" && (
            <div className="uta-graph-container" style={{
              marginTop: "20px",
              height: "600px",
              background: "#0f1420",
              borderRadius: "10px",
              padding: "16px",
              border: "1px solid #1e293b"
            }}>
              <TemperatureChart
                utaData={utaData}
                selectedUta={selectedUta}
                onClose={() => setActiveChart(null)} // 🔥 AICI E TOT
              />
            </div>
          )}

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
        <FiArrowLeft /> Back
      </button>
    </div>
  );
}