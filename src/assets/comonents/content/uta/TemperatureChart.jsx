// UtaChartEmbed.jsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ALL_PARAMS = [
  { key: "Air_inp_Temp",         label: "Temp Air hyrje",    unit: "°C",  color: "#f97316" },
  { key: "Air_Output_Temp",      label: "Temp Air dergim",   unit: "°C",  color: "#eab308" },
  { key: "Air_Return_Temp",      label: "Temp Air kthim",    unit: "°C",  color: "#84cc16" },
  { key: "Air_outHygro",         label: "Lagështira",         unit: "%",   color: "#06b6d4" },
  { key: "Water_InpChillTemp",   label: "Ujë Hyrje Chiller", unit: "°C",  color: "#3b82f6" },
  { key: "Water_outChill_Temp",  label: "Ujë Dalje Chiller", unit: "°C",  color: "#6366f1" },
  { key: "Water_InpBoilTemp",    label: "Ujë Hyrje Kaldaja", unit: "°C",  color: "#ec4899" },
  { key: "Water_OutputBoilTemp", label: "Ujë Dalje Kaldaja", unit: "°C",  color: "#f43f5e" },
  { key: "Boil_Pump_Invert",     label: "Pompa Kaldaja",     unit: "%",   color: "#a855f7" },
  { key: "Chiller_Pump_Invert",  label: "Pompa Chiller",     unit: "%",   color: "#8b5cf6" },
  { key: "Boil_Valve",           label: "Valvula Kaldaja",   unit: "%",   color: "#14b8a6" },
  { key: "Chiller_Valve",        label: "Valvula Chiller",   unit: "%",   color: "#10b981" },
  { key: "Inp_Damper",           label: "Damper Hyrje",      unit: "%",   color: "#f59e0b" },
  { key: "Output_Damper",        label: "Damper Dalje",      unit: "%",   color: "#ef4444" },
  { key: "Aspirator",            label: "Aspirator",         unit: "%",   color: "#64748b" },
  { key: "Ventilator",           label: "Ventilator",        unit: "%",   color: "#0ea5e9" },
  { key: "Out_Return_Pressure",  label: "Presioni",          unit: "bar", color: "#d946ef" },
];

// ─── Hook: coordonate viewport (fără scrollY/scrollX — position:fixed e relativ la viewport)
function useAnchorCoords(triggerRef, isOpen) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const recalc = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords({
      top:   r.bottom + 4,   // 4px gap sub trigger, în coordonate viewport
      left:  r.left,
      width: r.width,
    });
  }, [triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    recalc();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [isOpen, recalc]);

  return { coords, recalc };
}

// ─── Portal: randează lista direct în <body> cu position:fixed la coordonate viewport
function DropdownPortal({ isOpen, coords, minWidth = 180, innerRef, children }) {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div
      ref={innerRef}
      style={{
        position:     "fixed",
        top:          coords.top,
        left:         coords.left,
        width:        Math.max(coords.width, minWidth),
        zIndex:       999999,
        background:   "#131929",
        border:       "1px solid #2d3748",
        borderRadius: 8,
        boxShadow:    "0 12px 32px rgba(0,0,0,.6)",
        maxHeight:    "min(280px, 50vh)",
        overflowY:    "auto",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export default function UtaChartEmbed({ utaData, selectedUta: initialUta, onClose }) {
  const [selectedParams, setSelectedParams] = useState([]);
  const [chartUta,       setChartUta]       = useState(initialUta || utaData?.[0] || null);
  const [paramOpen,      setParamOpen]      = useState(false);
  const [utaOpen,        setUtaOpen]        = useState(false);

  const paramTriggerRef = useRef(null);
  const utaTriggerRef   = useRef(null);
  const paramDropRef    = useRef(null);
  const utaDropRef      = useRef(null);

  const { coords: paramCoords, recalc: recalcParam } = useAnchorCoords(paramTriggerRef, paramOpen);
  const { coords: utaCoords,   recalc: recalcUta   } = useAnchorCoords(utaTriggerRef,   utaOpen);

  // Închide la click în afara dropdown-urilor
  useEffect(() => {
    const handler = (e) => {
      if (
        paramOpen &&
        paramTriggerRef.current && !paramTriggerRef.current.contains(e.target) &&
        paramDropRef.current    && !paramDropRef.current.contains(e.target)
      ) setParamOpen(false);

      if (
        utaOpen &&
        utaTriggerRef.current && !utaTriggerRef.current.contains(e.target) &&
        utaDropRef.current    && !utaDropRef.current.contains(e.target)
      ) setUtaOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [paramOpen, utaOpen]);

  const toggleParam = (key) => {
    setSelectedParams(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
    setParamOpen(false);
  };

  const allUtas    = utaData || (initialUta ? [initialUta] : []);
  const activeData = chartUta ? [chartUta] : allUtas;

  const chartData = useMemo(() => ({
    labels: activeData.map((d, i) => d.time || `Pika ${i + 1}`),
    datasets: selectedParams.map(key => {
      const p = ALL_PARAMS.find(x => x.key === key);
      return {
        label:                `${p.label} (${p.unit})`,
        data:                 activeData.map(d => d[key] ?? null),
        borderColor:          p.color,
        backgroundColor:      p.color + "22",
        borderWidth:          2.5,
        tension:              0.4,
        pointRadius:          5,
        pointHoverRadius:     8,
        pointBackgroundColor: p.color,
        pointBorderColor:     "#0f1420",
        pointBorderWidth:     2,
        fill:                 false,
      };
    }),
  }), [activeData, selectedParams]);

  const chartOptions = {
    responsive:           true,
    maintainAspectRatio:  false,
    interaction:          { mode: "index", intersect: false },
    plugins: {
      legend:  { position: "top", labels: { color: "#cbd5e1", font: { size: 12, family: "'DM Mono',monospace" }, usePointStyle: true } },
      tooltip: { backgroundColor: "#1e2436", borderColor: "#334155", borderWidth: 1, titleColor: "#94a3b8", bodyColor: "#f1f5f9", padding: 12 },
    },
    scales: {
      x: { grid: { color: "#1e293b" }, ticks: { color: "#64748b", font: { family: "'DM Mono',monospace", size: 11 } } },
      y: { grid: { color: "#1e293b" }, ticks: { color: "#64748b", font: { family: "'DM Mono',monospace", size: 11 } } },
    },
  };

  const optStyle = (active) => ({
    display:       "flex",
    alignItems:    "center",
    gap:           8,
    padding:       "9px 13px",
    cursor:        "pointer",
    fontSize:      12,
    color:         active ? "#93c5fd" : "#94a3b8",
    background:    active ? "#1a2a45" : "transparent",
    borderBottom:  "1px solid #1e293b",
    transition:    "background 0.12s",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

        .uce-wrap { display:flex; flex-direction:column; height:100%; font-family:'DM Mono',monospace; color:#e2e8f0; gap:12px; }
        .uce-row  { display:flex; align-items:center; gap:10px; flex-shrink:0; flex-wrap:wrap; }

        .uce-trigger {
          display:flex; justify-content:space-between; align-items:center; gap:8px;
          background:#1a2035; border:1px solid #334155; padding:7px 12px; border-radius:8px;
          cursor:pointer; font-size:12px; color:#cbd5e1; user-select:none;
          transition:border-color .15s; min-width:160px;
        }
        .uce-trigger:hover { border-color:#3b82f6; }
        .uce-trigger.open  { background:#1e2d4a; border-color:#60a5fa; }
        .uce-trigger-text  { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .uce-chevron       { font-size:9px; color:#60a5fa; transition:transform .2s; flex-shrink:0; }
        .uce-trigger.open .uce-chevron { transform:rotate(180deg); }

        .uce-pulse    { width:7px; height:7px; border-radius:50%; background:#3b82f6; box-shadow:0 0 6px #3b82f6; animation:ucePulse 2s infinite; }
        .uce-uta-name { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; color:#93c5fd; letter-spacing:.06em; }
        @keyframes ucePulse { 0%,100%{opacity:1} 50%{opacity:.3} }

        .uce-close {
          display:inline-flex; align-items:center; justify-content:center;
          width:34px; height:34px; background:#1a2035; border:1px solid #f43f5e;
          border-radius:8px; color:#94a3b8; cursor:pointer; transition:all .15s;
          font-size:14px; margin-left:auto; flex-shrink:0;
        }
        .uce-close:hover { background:#2d1f1f; color:#ef4444; }

        .uce-box    { flex:1; background:#0a0f1a; border-radius:10px; border:1px solid #1e293b; display:flex; flex-direction:column; min-height:0; }
        .uce-boxhdr { display:flex; align-items:center; justify-content:flex-end; padding:10px 16px; border-bottom:1px solid #1e293b; flex-shrink:0; flex-wrap:wrap; gap:8px; }
        .uce-pills  { display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
        .uce-pill-label { font-size:10px; color:#475569; text-transform:uppercase; letter-spacing:.08em; }
        .uce-pill   { display:inline-flex; align-items:center; gap:4px; background:#131929; border:1px solid var(--c); border-radius:20px; padding:2px 8px; font-size:10px; color:var(--c); }
        .uce-pill-dot { width:5px; height:5px; border-radius:50%; background:var(--c); }
        .uce-chart  { flex:1; padding:12px 16px; min-height:0; }
        .uce-empty  { flex:1; display:flex; align-items:center; justify-content:center; color:#334155; font-size:13px; }

        .dd-opt:hover { background:#1a2035 !important; color:#e2e8f0 !important; }
      `}</style>

      <div className="uce-wrap">

        {/* TOP ROW */}
        <div className="uce-row">

          {/* Param trigger */}
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <div
              ref={paramTriggerRef}
              className={`uce-trigger ${paramOpen ? "open" : ""}`}
              onClick={() => {
                const next = !paramOpen;
                setParamOpen(next);
                setUtaOpen(false);
                if (next) recalcParam();
              }}
            >
              <span className="uce-trigger-text">Zgjidh parametër...</span>
              <FontAwesomeIcon icon={faChevronDown} className="uce-chevron" />
            </div>
          </div>

          {/* UTA trigger */}
          <div style={{ position: "relative" }}>
            <div
              ref={utaTriggerRef}
              className={`uce-trigger ${utaOpen ? "open" : ""}`}
              style={{ borderColor: "#3b82f6" }}
              onClick={() => {
                const next = !utaOpen;
                setUtaOpen(next);
                setParamOpen(false);
                if (next) recalcUta();
              }}
            >
              <div className="uce-pulse" />
              <span className="uce-uta-name">{chartUta?.id || "Zgjidh UTA"}</span>
              <FontAwesomeIcon icon={faChevronDown} className="uce-chevron" />
            </div>
          </div>

          {onClose && (
            <button className="uce-close" onClick={onClose} title="Mbyll">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* PORTALS */}
        <DropdownPortal isOpen={paramOpen} coords={paramCoords} minWidth={240} innerRef={paramDropRef}>
          {ALL_PARAMS.map(p => {
            const sel = selectedParams.includes(p.key);
            return (
              <div key={p.key} className="dd-opt" style={optStyle(sel)} onClick={() => toggleParam(p.key)}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                {p.label} ({p.unit})
                {sel && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, color: "#3b82f6", marginLeft: "auto" }} />}
              </div>
            );
          })}
        </DropdownPortal>

        <DropdownPortal isOpen={utaOpen} coords={utaCoords} minWidth={180} innerRef={utaDropRef}>
          {allUtas.map(uta => {
            const isAct    = chartUta?.id === uta.id;
            const sk       = (uta.status || "").toLowerCase();
            const dotColor = sk === "running" ? "#4ade80" : sk === "stopped" ? "#f87171" : "#64748b";
            const statusBg = sk === "running" ? "#14532d" : sk === "stopped" ? "#450a0a" : "#1e293b";
            const statusTx = sk === "running" ? "#4ade80" : sk === "stopped" ? "#f87171" : "#64748b";
            return (
              <div
                key={uta.id}
                className="dd-opt"
                style={optStyle(isAct)}
                onClick={() => { setChartUta(uta); setUtaOpen(false); }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                {uta.id}
                {uta.status && (
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4,
                    background: statusBg, color: statusTx,
                    textTransform: "uppercase", letterSpacing: ".06em", marginLeft: "auto",
                  }}>
                    {uta.status}
                  </span>
                )}
                {isAct && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, color: "#3b82f6", marginLeft: "auto" }} />}
              </div>
            );
          })}
        </DropdownPortal>

        {/* CHART BOX */}
        <div className="uce-box">
          <div className="uce-boxhdr">
            <div className="uce-pills">
              <span className="uce-pill-label">active:</span>
              {selectedParams.length > 0
                ? ALL_PARAMS.filter(p => selectedParams.includes(p.key)).map(p => (
                    <span key={p.key} className="uce-pill" style={{ "--c": p.color }}>
                      <span className="uce-pill-dot" />{p.label} ({p.unit})
                    </span>
                  ))
                : <span style={{ fontSize: 11, color: "#475569" }}>—</span>
              }
            </div>
          </div>

          {selectedParams.length > 0
            ? <div className="uce-chart"><Line data={chartData} options={chartOptions} /></div>
            : <div className="uce-empty">Zgjidh të paktën një parametër</div>
          }
        </div>

      </div>
    </>
  );
}