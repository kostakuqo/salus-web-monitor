// UtaSettingsPage.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay, faStop, faGear, faSave, faTimes,
  faChevronDown, faChevronUp, faArrowLeft, faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { initialUtaData } from "../../content/uta/uta data/utaData";

const FORM_FIELDS = [
  { key: "Air_inp_Temp", label: "Temp Air In", unit: "°C", step: 1 },
  { key: "Air_Return_Temp", label: "Temp Air Return", unit: "°C", step: 1 },
  { key: "Water_InpChillTemp", label: "Ujë Hyrje Chiller", unit: "°C", step: 1 },
  { key: "Out_Return_Pressure", label: "Presioni", unit: "bar", step: 0.1 },
];

export default function SettingsPage({
  utaData: utaDataProp,   // opțional — dacă vine din UtaRoot
  onBack ,  // <-- aici e back real
  onSave,
  onStart,
  onStop,
}) {
  // dacă componenta e montată standalone în router (fără UtaRoot),
  // folosește propriul state cu initialUtaData
  const [localData, setLocalData] = useState(
    utaDataProp === undefined ? initialUtaData : null
  );

  // sursa de adevăr: prop extern dacă există, altfel state local
  const utaData = utaDataProp ?? localData ?? [];

  // onSave intern când nu vine din afară
  const handleSaveData = onSave ?? (({ utaId, ...fields }) => {
    setLocalData(prev =>
      (prev ?? []).map(u => u.id === utaId ? { ...u, ...fields } : u)
    );
  });

  // onStart/onStop interne când nu vin din afară
  const handleStart = onStart ?? ((id) => {
    setLocalData(prev =>
      (prev ?? []).map(u => u.id === id ? { ...u, status: "ON" } : u)
    );
  });

  const handleStop = onStop ?? ((id) => {
    setLocalData(prev =>
      (prev ?? []).map(u => u.id === id ? { ...u, status: "OFF" } : u)
    );
  });

  const [expandedUta, setExpandedUta] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saveMsg, setSaveMsg] = useState("");
  const [savingId, setSavingId] = useState(null);

  const toggleExpand = (id) => {
    if (expandedUta === id) {
      setExpandedUta(null);
      setEditValues({});
      return;
    }
    const uta = utaData.find(u => u.id === id);
    const vals = FORM_FIELDS.reduce((acc, f) => {
      acc[f.key] = uta[f.key] ?? 0;
      return acc;
    }, {});
    setEditValues(vals);
    setExpandedUta(id);
  };

  const handleFieldChange = (key, val) =>
    setEditValues(prev => ({ ...prev, [key]: val }));

  const handleSave = (uta) => {
    setSavingId(uta.id);
    setTimeout(() => {
      // propagă în shared state prin UtaRoot
      handleSaveData({ utaId: uta.id, ...editValues });
      setSaveMsg(`${uta.id} — parametrat u ruajtën!`);
      setSavingId(null);
      setExpandedUta(null);
      setEditValues({});
      setTimeout(() => setSaveMsg(""), 2500);
    }, 600);
  };

  const statusColor = (s) =>
    s?.toLowerCase() === "on" ? "#4ade80"
      : s?.toLowerCase() === "off" ? "#f87171"
        : "#64748b";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        .usp-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .usp-root {
          min-height: 100vh;
          background: #080c14;
          font-family: 'IBM Plex Sans', sans-serif;
          color: #cbd5e1;
          padding: 0 0 60px;
        }

        /* ── TOPBAR ── */
        .usp-topbar {
          display: flex; align-items: center; gap: 16px;
          padding: 20px 32px;
          border-bottom: 1px solid #1a2236;
          position: sticky; top: 0;
          background: #080c14; z-index: 100;
        }
        .usp-back {
          display: flex; align-items: center; gap: 8px;
          background: none; border: 1px solid #1e2d42; border-radius: 6px;
          color: #64748b; font-size: 12px; padding: 7px 13px;
          cursor: pointer; font-family: 'IBM Plex Mono', monospace;
          transition: border-color .15s, color .15s;
        }
        .usp-back:hover { border-color: #3b82f6; color: #93c5fd; }
        .usp-title-block { flex: 1; }
        .usp-title {
          font-family: 'IBM Plex Mono', monospace; font-size: 13px;
          font-weight: 600; letter-spacing: .12em;
          text-transform: uppercase; color: #e2e8f0;
        }
        .usp-subtitle { font-size: 11px; color: #475569; margin-top: 2px; }
        .usp-count {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px;
          color: #334155; border: 1px solid #1a2236;
          border-radius: 4px; padding: 4px 10px;
        }

        /* ── TOAST ── */
        .usp-toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          background: #0f2a18; border: 1px solid #166534;
          color: #4ade80; font-size: 12px; font-family: 'IBM Plex Mono', monospace;
          padding: 10px 22px; border-radius: 6px;
          animation: usp-fadein .2s ease; z-index: 9999;
        }
        @keyframes usp-fadein {
          from { opacity:0; transform:translate(-50%,8px); }
          to   { opacity:1; transform:translate(-50%,0); }
        }

        /* ── LIST ── */
        .usp-list {
          padding: 24px 32px;
          display: flex; flex-direction: column; gap: 2px;
        }

        /* ── ROW ── */
        .usp-row {
          border: 1px solid #141e2e; border-radius: 8px;
          margin-bottom:30px;
          overflow: hidden; transition: border-color .15s;
        }
        .usp-row.expanded { border-color: #1e3a5f; }

        /* ── ROW HEADER ── */
        .usp-row-header {
          display: grid;
          grid-template-columns: 36px 1fr auto auto auto auto;
          align-items: center; gap: 12px;
          padding: 14px 18px; background: #0c1220;
        }
        .usp-status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--dot-color);
          box-shadow: 0 0 6px var(--dot-color);
          justify-self: center; flex-shrink: 0;
        }
        .usp-id {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px; font-weight: 600;
          color: #e2e8f0; letter-spacing: .04em;
        }
        .usp-status-label {
          font-size: 10px; font-family: 'IBM Plex Mono', monospace;
          color: var(--dot-color); text-transform: uppercase;
          letter-spacing: .08em; margin-top: 2px;
        }

        /* chips read-only */
        .usp-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .usp-chip {
          font-family: 'IBM Plex Mono', monospace; font-size: 10px;
          color: #475569; background: #0a0f1a;
          border: 1px solid #1a2236; border-radius: 4px;
          padding: 3px 8px; white-space: nowrap;
        }
        .usp-chip span { color: #94a3b8; }

        /* buttons */
        .usp-btn {
          display: inline-flex; align-items: center; gap: 6px;
          margin-right:10px;
          border: none; border-radius: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 500;
          padding: 7px 13px; cursor: pointer;
          transition: opacity .15s, transform .1s; white-space: nowrap;
        }
        .usp-btn:active { transform: scale(.97); }
        .usp-btn.start  { background: #14532d; color: #4ade80; border: 1px solid #166534; }
        .usp-btn.start:hover { background: #166534; }
        .usp-btn.stop   { background: #450a0a; color: #f87171; border: 1px solid #7f1d1d; }
        .usp-btn.stop:hover  { background: #7f1d1d; }
        .usp-btn.settings { background: #0f1e38; color: #60a5fa; border: 1px solid #1e3a5f; }
        .usp-btn.settings:hover { background: #1e3a5f; }
        .usp-btn.settings.active { background: #1e3a5f; border-color: #3b82f6; color: #93c5fd; }

        /* ── EXPAND PANEL ── */
        .usp-panel {
          background: #0a0f1a; border-top: 1px solid #141e2e;
          padding: 24px 20px 20px;
          animation: usp-slide .18s ease;
        }
        @keyframes usp-slide {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .usp-panel-title {
          font-family: 'IBM Plex Mono', monospace; font-size: 10px;
          text-transform: uppercase; letter-spacing: .12em; color: #334155;
          margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
        }
        .usp-panel-title::after { content:''; flex:1; height:1px; background:#141e2e; }

        .usp-fields {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px; margin-bottom: 20px;
        }
        .usp-field { display: flex; flex-direction: column; gap: 6px; }
        .usp-field label {
          font-size: 10px; font-family: 'IBM Plex Mono', monospace;
          color: #475569; text-transform: uppercase; letter-spacing: .08em;
        }
        .usp-field-input-wrap {
          display: flex; align-items: center;
          background: #0c1220; border: 1px solid #1e293b;
          border-radius: 6px; overflow: hidden; transition: border-color .15s;
        }
        .usp-field-input-wrap:focus-within { border-color: #3b82f6; }
        .usp-field input {
          flex:1; background:none; border:none; outline:none;
          padding: 9px 12px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px; color: #e2e8f0;
        }
        .usp-field-unit {
          padding: 0 10px; font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; color: #334155;
          border-left: 1px solid #1e293b; background: #090d18;
          align-self: stretch; display: flex; align-items: center;
        }
        .usp-panel-actions { display:flex; gap:10px; justify-content:flex-end; }
        .usp-btn.save {
          background: #0c2340; color: #60a5fa; border: 1px solid #1e4a7a;
          min-width: 100px; justify-content: center;
        }
        .usp-btn.save:hover { background: #1e3a5f; }
        .usp-btn.save.saving { opacity:.6; pointer-events:none; }
        .usp-btn.cancel { background:#0c1220; color:#475569; border:1px solid #1e293b; }
        .usp-btn.cancel:hover { color:#94a3b8; border-color:#334155; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .usp-topbar, .usp-list { padding-left:16px; padding-right:16px; }
          .usp-row-header {
            grid-template-columns: 28px 1fr;
            grid-template-rows: auto auto auto;
            gap: 10px;
          }
          .usp-chips { grid-column: 1 / -1; }
          .usp-fields { grid-template-columns: 1fr 1fr; }
          
          .usp-btn.start,
          .usp-btn.stop {
           flex: 1;                     /* ocupă tot spațiul disponibil */
                     /* butoane mai înalte */
                     /* text mai mare */
                  /* colțuri mai rotunjite */
          box-shadow: 0 4px 6px rgba(0,0,0,0.25); /* umbră subtilă */
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;                    /* spațiu între icon și text */
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .usp-btn.start:hover {
    background: #166534;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.3);
  }

  .usp-btn.stop:hover {
    background: #7f1d1d;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.3);
  }

  .usp-row-header {
    display: grid;
    grid-template-columns: 28px 1fr;
    grid-template-rows: auto auto auto auto; /* adăugat rând pentru butoane */
    gap: 10px;
  }

  .usp-btn-container {
    display: flex;
    gap: 12px;
    grid-column: 1 / -1;
    justify-content: space-between;
  }
          
        }
          
      `}</style>

      <div className="usp-root">

        {/* TOPBAR */}
        <div className="usp-topbar">
          <button
            className="usp-back"
            onClick={onBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <div className="usp-title-block">
            <div className="usp-title">
              <FontAwesomeIcon icon={faSliders} style={{ marginRight: 8, color: "#3b82f6" }} />
              Settings
            </div>
            <div className="usp-subtitle">Menaxhimi i njësive të trajtimit të ajrit</div>
          </div>
          <span className="usp-count">{utaData?.length ?? 0} UTA</span>
        </div>

        {/* LIST */}
        <div className="usp-list">
          {(utaData ?? []).map(uta => {
            const isExpanded = expandedUta === uta.id;
            const dot = statusColor(uta.status);

            return (
              <div key={uta.id} className={`usp-row ${isExpanded ? "expanded" : ""}`}>

                <div className="usp-row-header">

                  <div className="usp-status-dot" style={{ "--dot-color": dot }} />

                  {/* id + status — live din utaData (reflectă Start/Stop imediat) */}
                  <div style={{ "--dot-color": dot }}>
                    <div className="usp-id">{uta.id}</div>
                    <div className="usp-status-label">{uta.status ?? "—"}</div>
                  </div>

                  {/* chips — live din utaData (reflectă Save din UtaInterface imediat) */}
                  <div className="usp-chips">
                    <span className="usp-chip">Air In <span>{uta.Air_inp_Temp ?? "—"}°C</span></span>
                    <span className="usp-chip">Return <span>{uta.Air_Return_Temp ?? "—"}°C</span></span>
                    <span className="usp-chip">Chiller <span>{uta.Water_InpChillTemp ?? "—"}°C</span></span>
                    <span className="usp-chip">P <span>{uta.Out_Return_Pressure ?? "—"} bar</span></span>
                  </div>

                  <div className="usp-btn-container">
                    <button className="usp-btn start" onClick={() => handleStart(uta.id)}>
                      <FontAwesomeIcon icon={faPlay} /> Start
                    </button>

                    <button className="usp-btn stop" onClick={() => handleStop(uta.id)}>
                      <FontAwesomeIcon icon={faStop} /> Stop
                    </button>
                  </div>

                  <button
                    className={`usp-btn settings ${isExpanded ? "active" : ""}`}
                    onClick={() => toggleExpand(uta.id)}
                  >
                    <FontAwesomeIcon icon={faGear} />
                    Parametrat
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronUp : faChevronDown}
                      style={{ fontSize: 9 }}
                    />
                  </button>
                </div>

                {isExpanded && (
                  <div className="usp-panel">
                    <div className="usp-panel-title">
                      <FontAwesomeIcon icon={faGear} style={{ fontSize: 10 }} />
                      Modifiko parametrat — {uta.id}
                    </div>

                    <div className="usp-fields">
                      {FORM_FIELDS.map(f => (
                        <div key={f.key} className="usp-field">
                          <label>{f.label}</label>
                          <div className="usp-field-input-wrap">
                            <input
                              type="number"
                              step={f.step}
                              value={editValues[f.key] ?? ""}
                              onChange={e => handleFieldChange(f.key, +e.target.value)}
                            />
                            <span className="usp-field-unit">{f.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="usp-panel-actions">
                      <button
                        className="usp-btn cancel"
                        onClick={() => { setExpandedUta(null); setEditValues({}); }}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Anullo
                      </button>
                      <button
                        className={`usp-btn save ${savingId === uta.id ? "saving" : ""}`}
                        onClick={() => handleSave(uta)}
                      >
                        <FontAwesomeIcon icon={faSave} />
                        {savingId === uta.id ? "Duke ruajtur..." : "Ruaj"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {saveMsg && <div className="usp-toast">{saveMsg}</div>}

      </div>
    </>
  );
}