// UtaChartEmbed.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ALL_PARAMS = [
  { key: "Air_inp_Temp", label: "Temp Air In", unit: "°C", color: "#f97316" },
  { key: "Air_Output_Temp", label: "Temp Air Out", unit: "°C", color: "#eab308" },
  { key: "Air_Return_Temp", label: "Temp Air Return", unit: "°C", color: "#84cc16" },
  { key: "Air_outHygro", label: "Lagështira", unit: "%", color: "#06b6d4" },
  { key: "Water_InpChillTemp", label: "Ujë Hyrje Chiller", unit: "°C", color: "#3b82f6" },
  { key: "Water_outChill_Temp", label: "Ujë Dalje Chiller", unit: "°C", color: "#6366f1" },
  { key: "Water_InpBoilTemp", label: "Ujë Hyrje Kaldaja", unit: "°C", color: "#ec4899" },
  { key: "Water_OutputBoilTemp", label: "Ujë Dalje Kaldaja", unit: "°C", color: "#f43f5e" },
  { key: "Boil_Pump_Invert", label: "Pompa Kaldaja", unit: "%", color: "#a855f7" },
  { key: "Chiller_Pump_Invert", label: "Pompa Chiller", unit: "%", color: "#8b5cf6" },
  { key: "Boil_Valve", label: "Valvula Kaldaja", unit: "%", color: "#14b8a6" },
  { key: "Chiller_Valve", label: "Valvula Chiller", unit: "%", color: "#10b981" },
  { key: "Inp_Damper", label: "Damper Hyrje", unit: "%", color: "#f59e0b" },
  { key: "Output_Damper", label: "Damper Dalje", unit: "%", color: "#ef4444" },
  { key: "Aspirator", label: "Aspirator", unit: "%", color: "#64748b" },
  { key: "Ventilator", label: "Ventilator", unit: "%", color: "#0ea5e9" },
  { key: "Out_Return_Pressure", label: "Presioni", unit: "bar", color: "#d946ef" },
];

export default function UtaChartEmbed({ utaData, selectedUta: initialUta, onClose }) {
  const [selectedParams, setSelectedParams] = useState([]);
  const [chartUta, setChartUta] = useState(initialUta || utaData?.[0] || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [paramDropdownOpen, setParamDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const paramDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (paramDropdownRef.current && !paramDropdownRef.current.contains(e.target))
        setParamDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Toggle parametru + închide automat dropdown-ul
  const toggleParam = (key) => {
    setSelectedParams((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setParamDropdownOpen(false); // ← închide după selecție
  };

  const data = chartUta ? [chartUta] : (utaData || []);

  const chartData = useMemo(() => {
    const labels = data.map((d, i) => d.time || `Pika ${i + 1}`);
    const datasets = selectedParams.map((key) => {
      const param = ALL_PARAMS.find((p) => p.key === key);
      return {
        label: `${param.label} (${param.unit})`,
        data: data.map((d) => d[key] ?? null),
        borderColor: param.color,
        backgroundColor: param.color + "22",
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: param.color,
        pointBorderColor: "#0f1420",
        pointBorderWidth: 2,
        fill: false,
      };
    });
    return { labels, datasets };
  }, [data, selectedParams]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#cbd5e1", font: { size: 12, family: "'DM Mono', monospace" }, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: "#1e2436", borderColor: "#334155", borderWidth: 1,
        titleColor: "#94a3b8", bodyColor: "#f1f5f9", padding: 12,
      },
    },
    scales: {
      x: { grid: { color: "#1e293b" }, ticks: { color: "#64748b", font: { family: "'DM Mono', monospace", size: 11 } } },
      y: { grid: { color: "#1e293b" }, ticks: { color: "#64748b", font: { family: "'DM Mono', monospace", size: 11 } } },
    },
  };

  const activeParams = selectedParams.map((k) => ALL_PARAMS.find((p) => p.key === k)).filter(Boolean);
  const allUtas = utaData || (initialUta ? [initialUta] : []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

        .uce-wrap {
          display: flex; flex-direction: column; height: 100%;
          font-family: 'DM Mono', monospace; color: #e2e8f0; gap: 12px;
        }

        /* ── TOP ROW (param select + close btn) ── */
        .uce-top-row {
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }

        /* ── PARAM DROPDOWN ── */
        .uce-param-select { position: relative; flex: 1; max-width: 340px; }
        .uce-param-trigger {
          display: flex; justify-content: space-between; align-items: center;
          background: #1a2035; border: 1px solid #334155;
          padding: 7px 12px; border-radius: 8px; cursor: pointer;
          font-size: 12px; color: #cbd5e1; gap: 8px;
          transition: all 0.15s; user-select: none;
        }
        .uce-param-trigger:hover  { border-color: #3b82f6; }
        .uce-param-trigger.open   { background: #1e2d4a; border-color: #60a5fa; }
        .uce-param-trigger-text   { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .uce-param-chevron        { font-size: 9px; color: #60a5fa; transition: transform 0.2s; flex-shrink: 0; }
        .uce-param-trigger.open .uce-param-chevron { transform: rotate(180deg); }

        .uce-param-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0;
          width: 100%; min-width: 220px;
          background: #131929; border: 1px solid #2d3748; border-radius: 8px;
          z-index: 50; max-height: 260px; overflow-y: auto;
          box-shadow: 0 12px 32px rgba(0,0,0,.5);
          animation: uceDdIn 0.15s ease;
        }
        .uce-param-dropdown::-webkit-scrollbar { width: 4px; }
        .uce-param-dropdown::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        @keyframes uceDdIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .uce-param-opt {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 13px; cursor: pointer; font-size: 12px; color: #94a3b8;
          border-bottom: 1px solid #1e293b; transition: background 0.12s;
        }
        .uce-param-opt:last-child  { border-bottom: none; }
        .uce-param-opt:hover       { background: #1a2035; color: #e2e8f0; }
        .uce-param-opt.active      { background: #1a2a45; color: #93c5fd; }
        .uce-param-opt-dot         { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .uce-param-opt-check       { font-size: 10px; color: #3b82f6; margin-left: auto; }

        /* ── CLOSE BUTTON ── */
        .uce-close-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; flex-shrink: 0;
          background: #1a2035; border: 1px solid #2d3748;
          border-radius: 8px; color: #64748b;
          cursor: pointer; transition: all 0.15s; font-size: 14px;
          border:1px solid red;
        }
        .uce-close-btn:hover { background: #2d1f1f; border-color: #ef4444; color: #ef4444; }

        /* ── CHART BOX ── */
        .uce-box {
          flex: 1; background: #0a0f1a; border-radius: 10px;
          border: 1px solid #1e293b; display: flex;
          flex-direction: column; overflow: hidden; min-height: 0;
        }
        .uce-box-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; border-bottom: 1px solid #1e293b;
          flex-shrink: 0; flex-wrap: wrap; gap: 8px;
        }
        .uce-box-header-left { display: flex; align-items: center; gap: 10px; }

        /* UTA selector */
        .uce-uta-sel { position: relative; }
        .uce-uta-trigger {
          display: inline-flex; align-items: center; gap: 7px;
          background: #1a2035; border: 1px solid #3b82f6;
          border-radius: 7px; padding: 5px 11px;
          cursor: pointer; transition: all 0.15s; user-select: none;
        }
        .uce-uta-trigger:hover, .uce-uta-trigger.open { background: #1e2d4a; border-color: #60a5fa; }
        .uce-pulse {
          width: 7px; height: 7px; border-radius: 50%;
          background: #3b82f6; box-shadow: 0 0 6px #3b82f6;
          animation: ucePulse 2s infinite;
        }
        @keyframes ucePulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .uce-uta-name { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; color:#93c5fd; letter-spacing:0.06em; }
        .uce-chevron  { font-size:9px; color:#60a5fa; transition:transform 0.2s; }
        .uce-uta-trigger.open .uce-chevron { transform:rotate(180deg); }

      .uce-uta-dropdown {
  position: absolute; 
  top: calc(100% + 6px); 
  left: 0;
  background: #131929; 
  border: 1px solid #2d3748; 
  border-radius: 8px;
  min-width: 160px; 
  max-height: 60vh;      /* limită pe mobil */
  overflow-y: auto;       /* scroll dacă lista e lungă */
  box-shadow: 0 12px 32px rgba(0,0,0,.5);
  z-index: 50; 
  animation: uceDdIn 0.15s ease;
}
        .uce-opt {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 13px; cursor: pointer; font-size: 12px; color: #94a3b8;
          border-bottom: 1px solid #1e293b; transition: background 0.12s;
        }
        .uce-opt:last-child { border-bottom: none; }
        .uce-opt:hover      { background: #1a2035; color: #e2e8f0; }
        .uce-opt.active     { background: #1a2a45; color: #93c5fd; }
        .uce-opt-dot        { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .uce-opt-status     { font-size:9px; margin-left:auto; padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:0.06em; }
        .uce-opt-status.running { background:#14532d; color:#4ade80; }
        .uce-opt-status.stopped { background:#450a0a; color:#f87171; }
        .uce-opt-status.idle    { background:#1e293b; color:#64748b; }
        .uce-opt-check { font-size:10px; color:#3b82f6; margin-left:auto; }

        /* Pills */
        .uce-pills       { display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
        .uce-pills-label { font-size:10px; color:#475569; text-transform:uppercase; letter-spacing:0.08em; }
        .uce-pill        { display:inline-flex; align-items:center; gap:4px; background:#131929; border:1px solid var(--c); border-radius:20px; padding:2px 8px; font-size:10px; color:var(--c); }
        .uce-pill-dot    { width:5px; height:5px; border-radius:50%; background:var(--c); }

        /* Chart */
        .uce-chart { flex:1; padding:12px 16px; min-height:0; }
        .uce-empty { flex:1; display:flex; align-items:center; justify-content:center; color:#334155; font-size:13px; }
      `}</style>

      <div className="uce-wrap">

        {/* ── TOP ROW: param dropdown + buton close ── */}
        <div className="uce-top-row">

          {/* Param dropdown */}
          <div className="uce-param-select" ref={paramDropdownRef}>
            <div
              className={`uce-param-trigger ${paramDropdownOpen ? "open" : ""}`}
              onClick={() => setParamDropdownOpen((v) => !v)}
            >
              <span className="uce-param-trigger-text">
                Zgjidh parametër...
              </span>
              <FontAwesomeIcon icon={faChevronDown} className="uce-param-chevron" />
            </div>

            {paramDropdownOpen && (
              <div className="uce-param-dropdown">
                {ALL_PARAMS.map((param) => {
                  const sel = selectedParams.includes(param.key);
                  return (
                    <div
                      key={param.key}
                      className={`uce-param-opt ${sel ? "active" : ""}`}
                      onClick={() => toggleParam(param.key)}  // ← auto-close brenda
                    >
                      <div className="uce-param-opt-dot" style={{ background: param.color }} />
                      {param.label} ({param.unit})
                      {sel && <FontAwesomeIcon icon={faCheck} className="uce-param-opt-check" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── BUTON CLOSE ── */}
          {onClose && (
            <button className="uce-close-btn" onClick={onClose} title="Mbyll grafikun">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* ── CHART BOX ── */}
        <div className="uce-box">

          <div className="uce-box-header">
            <div className="uce-box-header-left">

              {/* UTA dropdown */}
              <div className="uce-uta-sel" ref={dropdownRef}>
                <div
                  className={`uce-uta-trigger ${dropdownOpen ? "open" : ""}`}
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <div className="uce-pulse" />
                  <span className="uce-uta-name">{chartUta?.id || "Zgjidh UTA"}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="uce-chevron" />
                </div>

                {dropdownOpen && (
                  <div className="uce-uta-dropdown">
                    {allUtas.map((uta) => {
                      const isAct = chartUta?.id === uta.id;
                      const statusKey = (uta.status || "").toLowerCase();
                      return (
                        <div
                          key={uta.id}
                          className={`uce-opt ${isAct ? "active" : ""}`}
                          onClick={() => { setChartUta(uta); setDropdownOpen(false); }}
                        >
                          <div
                            className="uce-opt-dot"
                            style={{
                              background:
                                statusKey === "running" ? "#4ade80" :
                                  statusKey === "stopped" ? "#f87171" : "#64748b",
                            }}
                          />
                          {uta.id}
                          {uta.status && (
                            <span className={`uce-opt-status ${statusKey}`}>{uta.status}</span>
                          )}
                          {isAct && <FontAwesomeIcon icon={faCheck} className="uce-opt-check" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active pills */}
            <div className="uce-pills">
              <span className="uce-pills-label">created:</span>
              {activeParams.length > 0
                ? activeParams.map((p) => (
                  <span key={p.key} className="uce-pill" style={{ "--c": p.color }}>
                    <span className="uce-pill-dot" />
                    {p.label} ({p.unit})
                  </span>
                ))
                : <span style={{ fontSize: "11px", color: "#475569" }}>—</span>
              }
            </div>
          </div>

          {selectedParams.length > 0 ? (
            <div className="uce-chart">
              <Line data={chartData} options={options} />
            </div>
          ) : (
            <div className="uce-empty">Zgjidh të paktën një parametër</div>
          )}
        </div>
      </div>
    </>
  );
}