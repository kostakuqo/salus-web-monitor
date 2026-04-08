import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import "./UtaInterface.css";
import UtaCardElement from "./UtaCardElement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TemperatureChart from "./TemperatureChart";
import { useUta } from "../../../../services/UtaProvider";
import { useAuth } from "../../../../services/AuthProvider";
import {
  faGear, faSave, faTimes,
  faPlay, faStop, faSliders,
} from "@fortawesome/free-solid-svg-icons";

const FORM_FIELDS = [
  "Air_inp_Temp",
  "Air_Return_Temp",
  "Water_InpChillTemp",
  "Out_Return_Pressure",
];

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

export default function UtaInterface({ onBack, onSave, onOpenSettings }) {
  const { utas: utaData, setUtas, history, handleStart, handleStop } = useUta();
  const { role } = useAuth();

  const [selectedUta, setSelectedUta] = useState(null);
  const [activeChart, setActiveChart] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUta, setEditedUta] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const selectedUtaFresh = selectedUta
    ? utaData.find(u => u.id === selectedUta.id) ?? selectedUta
    : null;

  const selectedHistory = history?.[selectedUtaFresh?.id] ?? [];

  // ── WRAPPER SAFE START ─────────────────────────────
  const safeStart = async (utaId) => {
    if (role === "viewer") {
      setStatusMessage("❌ Nuk keni leje te startoni UTA^ t!");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
    try {
      const data = await handleStart(utaId);
      if (data?.success) {
        setSelectedUta(prev => prev ? { ...prev, status: "ON" } : prev);
        setStatusMessage(`✅ ${utaId} u startua succes!`);
      }
    } catch {
      setStatusMessage(`❌ gabim gjate startit UTA ${utaId}`);
    }
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // ── WRAPPER SAFE STOP ──────────────────────────────
  const safeStop = async (utaId) => {
    if (role === "viewer") {
      setStatusMessage("❌ Nuk keni leje per te stopuar UTA^ t!");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
    try {
      const data = await handleStop(utaId);
      if (data?.success) {
        setSelectedUta(prev => prev ? { ...prev, status: "OFF" } : prev);
        setStatusMessage(`✅ ${utaId} u stopua me sukses!`);
      }
    } catch {
      setStatusMessage(`❌ gabim gjate stopimit te UTA^ t  ${utaId}`);
    }
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // ── SAVE EDITED ─────────────────────────────────────
  const saveEdited = () => {
    if (!editedUta) return;
    const fields = FORM_FIELDS.reduce((acc, f) => {
      acc[f] = editedUta[f];
      return acc;
    }, {});
    onSave?.({ utaId: editedUta.id, ...fields });
    setUtas(prev => prev.map(u => u.id === editedUta.id ? { ...u, ...fields } : u));
    setSelectedUta(prev => prev ? { ...prev, ...fields } : prev);
    setSaveMessage("Parametrat u ruajten me sukses!");
    setEditMode(false);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // ── SELECTED UTA VIEW ──────────────────────────────
  if (selectedUtaFresh) {
    return (
      <div className="uta-interface main-uta">
        {statusMessage && <div className="alert-modal"><div className="alert-modal-content">{statusMessage}</div></div>}
        {saveMessage && <div className="alert-modal"><div className="alert-modal-content">{saveMessage}</div></div>}

        <div className="uta-details-container">
          <div className="uta-details-header">
            <button className="back-btn" onClick={() => { setSelectedUta(null); setActiveChart(null); setEditMode(false); }}>
              <FiArrowLeft /> Back
            </button>
            <h2>{selectedUtaFresh.id}</h2>
            <span className={`status-tag ${selectedUtaFresh.status.toLowerCase()}`}>{selectedUtaFresh.status}</span>

            <div className="uta-actions">
              <button className="uta-button start" onClick={() => safeStart(selectedUtaFresh.id)}>
                <FontAwesomeIcon icon={faPlay} /> Start
              </button>
              <button className="uta-button stop" onClick={() => safeStop(selectedUtaFresh.id)}>
                <FontAwesomeIcon icon={faStop} /> Stop
              </button>
              <button
                className="uta-button edit"
                onClick={() => {
                  if (role === "viewer") {
                    setStatusMessage("❌ Nuk Keni leje per te modifikuar parametrat!");
                    setTimeout(() => setStatusMessage(""), 3000);
                    return;
                  }
                  setEditedUta({ ...selectedUtaFresh });
                  setEditMode(true);
                }}
              >
                <FontAwesomeIcon icon={faGear} /> Modifiko 
              </button>
            </div>
          </div>

          {editMode && editedUta && (
            <div className="edit-form">
              <h3>Modifiko Parametrat</h3>
              <form onSubmit={e => { e.preventDefault(); saveEdited(); }}>
                {FORM_FIELDS.map(field => (
                  <label key={field}>
                    {FIELD_LABELS[field]?.label || field}:
                    <input type="number" step={field.includes("Pressure") ? "0.1" : "1"} value={editedUta[field]} onChange={e => setEditedUta({ ...editedUta, [field]: +e.target.value })} />
                  </label>
                ))}
                <div className="form-actions">
                  <button type="submit" className="save-data"><FontAwesomeIcon icon={faSave} /> Save</button>
                  <button type="button" className="cancel-data" onClick={() => setEditMode(false)}><FontAwesomeIcon icon={faTimes} /> Anullo</button>
                </div>
              </form>
            </div>
          )}

          <div className="uta-details-grid">
            {Object.entries(selectedUtaFresh).map(([key, val]) => {
              if (!FIELD_LABELS[key]) return null;
              const { label, unit } = FIELD_LABELS[key];
              return <div key={key} className="data-card"><h4>{label}</h4><p>{val}{unit && ` ${unit}`}</p></div>;
            })}
          </div>

          <button className="uta-button graph-bottom" onClick={() => setActiveChart(prev => prev ? null : "main")}>
            <GoGraph style={{ marginRight: "6px" }} /> Shiko Grafiket
          </button>

          {activeChart === "main" && (
            <div className="uta-graph-container">
              <TemperatureChart utaData={utaData} selectedUta={selectedUtaFresh} historyData={selectedHistory} onClose={() => setActiveChart(null)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ───────────────────────────────────────
  return (
    <div className="uta-interface">
      {statusMessage && <div className="status-message">{statusMessage}</div>}
      <div className="uta-row header" style={{ display: "flex", alignItems: "center" }}>
        <div className="uta-cell"><strong>UTA ID</strong></div>
        <div className="uta-cell"><strong>Air In</strong></div>
        <div className="uta-cell"><strong>Air Return</strong></div>
        <div className="uta-cell"><strong>Water In</strong></div>
        <div className="uta-cell"><strong>Pressure</strong></div>
        <div className="uta-cell"><strong>Start</strong></div>
        <div className="uta-cell"><strong>Stop</strong></div>
      </div>

      {utaData.map(uta => (
        <UtaCardElement
          key={uta.id}
          {...uta}
          onClick={() => setSelectedUta(uta)}
          onStart={role !== "viewer" ? () => safeStart(uta.id) : undefined}
          onStop={role !== "viewer" ? () => safeStop(uta.id) : undefined}
        />
      ))}

      {onOpenSettings && <button className="uta-button edit" style={{ marginLeft: "auto" }} onClick={onOpenSettings}><FontAwesomeIcon icon={faSliders} /> Settings</button>}
      <button className="back-button" onClick={onBack}><FiArrowLeft /> Back</button>
    </div>
  );
}