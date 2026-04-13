import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck, faTimes, faClock, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useUta } from "../../../../services/UtaProvider";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ALL_PARAMS = [
  { key: "Air_inp_Temp",         label: "Temp Air hyrje",      unit: "°C", color: "#f97316" },
  { key: "Air_Output_Temp",      label: "Temp Air dërgim",     unit: "°C", color: "#eab308" },
  { key: "Air_Return_Temp",      label: "Temp Air kthim",      unit: "°C", color: "#84cc16" },
  { key: "Air_outHygro",         label: "Lagështira",          unit: "%",  color: "#06b6d4" },
  { key: "Water_InpChillTemp",   label: "Ujë Hyrje Chiller",   unit: "°C", color: "#3b82f6" },
  { key: "Water_outChill_Temp",  label: "Ujë Dalje Chiller",   unit: "°C", color: "#6366f1" },
  { key: "Water_InpBoilTemp",    label: "Ujë Hyrje Kaldaja",   unit: "°C", color: "#ec4899" },
  { key: "Water_OutputBoilTemp", label: "Ujë Dalje Kaldaja",   unit: "°C", color: "#f43f5e" },
  { key: "Boil_Pump_Invert",     label: "Pompa Kaldaja",       unit: "%",  color: "#a855f7" },
  { key: "Chiller_Pump_Invert",  label: "Pompa Chiller",       unit: "%",  color: "#8b5cf6" },
  { key: "Boil_Valve",           label: "Valvula Kaldaja",     unit: "%",  color: "#14b8a6" },
  { key: "Chiller_Valve",        label: "Valvula Chiller",     unit: "%",  color: "#10b981" },
  { key: "Inp_Damper",           label: "Damper Hyrje",        unit: "%",  color: "#f59e0b" },
  { key: "Output_Damper",        label: "Damper Dalje",        unit: "%",  color: "#ef4444" },
  { key: "Aspirator",            label: "Aspirator",           unit: "%",  color: "#64748b" },
  { key: "Ventilator",           label: "Ventilator",          unit: "%",  color: "#0ea5e9" },
  { key: "Out_Return_Pressure",  label: "Presioni",            unit: "bar",color: "#d946ef" },
];

/* ─── portal dropdown ───────────────────────────────────────────────────── */
function useAnchorCoords(triggerRef, isOpen) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const recalc = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
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

function DropdownPortal({ isOpen, coords, minWidth = 180, innerRef, children }) {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div ref={innerRef} style={{
      position: "fixed", top: coords.top, left: coords.left,
      width: Math.max(coords.width, minWidth), zIndex: 999999,
      background: "#131929", border: "1px solid #2d3748", borderRadius: 8,
      boxShadow: "0 12px 32px rgba(0,0,0,.6)",
      maxHeight: "min(280px, 50vh)", overflowY: "auto",
    }}>
      {children}
    </div>,
    document.body
  );
}

/* ─── helpers ───────────────────────────────────────────────────────────── */
function toHHMM(timeStr) {
  if (!timeStr) return "";
  const m = timeStr.match(/(\d{2}:\d{2})$/);
  return m ? m[1] : timeStr;
}

function dayProgress() {
  const n = new Date();
  return ((n.getHours() * 60 + n.getMinutes()) / 1440) * 100;
}

function getTodayStr() {
  const n = new Date();
  return `${n.getDate().toString().padStart(2,"0")}/${(n.getMonth()+1).toString().padStart(2,"0")}/${n.getFullYear()}`;
}

/** Formatează "DD/MM/YYYY" → label frumos */
function formatDateLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return "Sot";
  const [d, m, y] = dateStr.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate()     === yesterday.getDate() &&
    date.getMonth()    === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) return "Dje";
  return date.toLocaleDateString("sq-AL", { weekday: "short", day: "2-digit", month: "short" });
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function TemperatureChart({ utaData, selectedUta: initialUta, onClose }) {
  const { history } = useUta();

  const todayStr = getTodayStr();

  const [selectedParams, setSelectedParams] = useState([]);
  const [chartUta,       setChartUta]       = useState(initialUta || utaData?.[0] || null);
  const [selectedDate,   setSelectedDate]   = useState(todayStr);
  const [paramOpen,      setParamOpen]      = useState(false);
  const [utaOpen,        setUtaOpen]        = useState(false);
  const [dateOpen,       setDateOpen]       = useState(false);
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 640);

  const paramTriggerRef = useRef(null);
  const utaTriggerRef   = useRef(null);
  const dateTriggerRef  = useRef(null);
  const paramDropRef    = useRef(null);
  const utaDropRef      = useRef(null);
  const dateDropRef     = useRef(null);

  const { coords: paramCoords, recalc: recalcParam } = useAnchorCoords(paramTriggerRef, paramOpen);
  const { coords: utaCoords,   recalc: recalcUta   } = useAnchorCoords(utaTriggerRef,   utaOpen);
  const { coords: dateCoords,  recalc: recalcDate  } = useAnchorCoords(dateTriggerRef,  dateOpen);

  useEffect(() => { if (initialUta) setChartUta(initialUta); }, [initialUta?.id]);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (paramOpen && !paramTriggerRef.current?.contains(e.target) && !paramDropRef.current?.contains(e.target)) setParamOpen(false);
      if (utaOpen   && !utaTriggerRef.current?.contains(e.target)   && !utaDropRef.current?.contains(e.target))   setUtaOpen(false);
      if (dateOpen  && !dateTriggerRef.current?.contains(e.target)  && !dateDropRef.current?.contains(e.target))  setDateOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [paramOpen, utaOpen, dateOpen]);

  // Când se schimbă UTA, dacă data selectată nu există pentru noua UTA, reset la azi
  useEffect(() => {
    const raw = history[chartUta?.id] ?? [];
    const dates = [...new Set(raw.map(p => p.date).filter(Boolean))];
    if (!dates.includes(selectedDate)) setSelectedDate(todayStr);
  }, [chartUta?.id]);

  const toggleParam = (key) => {
    setSelectedParams(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
    setParamOpen(false);
  };

  const allUtas = utaData || (initialUta ? [initialUta] : []);

  // ── Zilele disponibile pentru UTA selectată ──────────────────────────────
  const availableDates = useMemo(() => {
    const raw = history[chartUta?.id] ?? [];
    const dates = [...new Set(raw.map(p => p.date).filter(Boolean))];
    // sortăm descrescător (cele mai recente primele)
    return dates.sort((a, b) => {
      const parse = s => { const [d,m,y] = s.split("/").map(Number); return new Date(y,m-1,d); };
      return parse(b) - parse(a);
    });
  }, [history, chartUta?.id]);

  // ── Punctele pentru ziua selectată ──────────────────────────────────────
  const todayPts = useMemo(() => {
    const raw = history[chartUta?.id] ?? [];
    return raw.filter(p =>
      p.date === selectedDate ||
      (p.time || "").startsWith(selectedDate.substring(0, 5))
    );
  }, [history, chartUta?.id, selectedDate]);

  const isToday   = selectedDate === todayStr;
  const dateLabel = formatDateLabel(selectedDate, todayStr);

  const todayLabelFull = (() => {
    const [d, m, y] = selectedDate.split("/").map(Number);
    return new Date(y, m-1, d).toLocaleDateString("sq-AL", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
  })();

  const firstTime = todayPts.length ? toHHMM(todayPts[0].time) : null;
  const lastTime  = todayPts.length ? toHHMM(todayPts[todayPts.length - 1].time) : null;

  const labels = useMemo(() => todayPts.map(p => toHHMM(p.time)), [todayPts]);

  // ── chart data ───────────────────────────────────────────────────────────
  const chartData = useMemo(() => ({
    labels,
    datasets: selectedParams.map(key => {
      const p    = ALL_PARAMS.find(x => x.key === key);
      const vals = todayPts.map(pt => pt[key] ?? null);
      return {
        label: `${p.label} (${p.unit})`,
        data: vals,
        borderColor: p.color,
        backgroundColor: p.color + "15",
        borderWidth: isMobile ? 2 : 2.5,
        tension: 0.35,
        pointRadius: vals.map(v => v !== null ? (isMobile ? 3 : 4) : 0),
        pointHoverRadius: 7,
        pointBackgroundColor: p.color,
        pointBorderColor: "#0f1420",
        pointBorderWidth: 2,
        fill: false,
        spanGaps: false,
      };
    }),
  }), [todayPts, selectedParams, isMobile, labels]);

  // ── chart options ────────────────────────────────────────────────────────
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e2436",
        borderColor: "#334155",
        borderWidth: 1,
        titleColor: "#94a3b8",
        bodyColor: "#f1f5f9",
        padding: isMobile ? 8 : 12,
        bodyFont:  { size: isMobile ? 11 : 12, family: "'DM Mono',monospace" },
        titleFont: { size: isMobile ? 10 : 11, family: "'DM Mono',monospace" },
        callbacks: {
          title: (items) => `🕐 ${labels[items[0]?.dataIndex] ?? ""}`,
          label: (ctx) => {
            if (ctx.parsed.y === null) return null;
            const p = ALL_PARAMS.find(x => `${x.label} (${x.unit})` === ctx.dataset.label);
            return ` ${p?.label ?? ctx.dataset.label}: ${ctx.parsed.y} ${p?.unit ?? ""}`;
          },
        },
        filter: (item) => item.parsed.y !== null,
      },
    },
    scales: {
      x: {
        grid:   { color: "#1a2235", lineWidth: 1 },
        border: { color: "#1e293b" },
        ticks: {
          color: "#475569",
          font: { family: "'DM Mono',monospace", size: isMobile ? 9 : 11 },
          maxTicksLimit: isMobile ? 6 : 12,
          maxRotation: isMobile ? 45 : 30,
          minRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        grid:   { color: "#1a2235", lineWidth: 1 },
        border: { color: "#1e293b" },
        ticks: {
          color: "#475569",
          font: { family: "'DM Mono',monospace", size: isMobile ? 9 : 11 },
          maxTicksLimit: 6,
        },
      },
    },
    layout: { padding: { top: 8, right: isMobile ? 4 : 16, bottom: 4, left: 0 } },
  }), [isMobile, labels]);

  /* ─── CSS ──────────────────────────────────────────────────────────────── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');
    .tc-wrap{display:flex;flex-direction:column;height:100%;font-family:'DM Mono',monospace;color:#e2e8f0;gap:10px;}
    .tc-toprow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    .tc-trigger{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#1a2035;border:1px solid #334155;padding:7px 11px;border-radius:8px;cursor:pointer;font-size:12px;color:#cbd5e1;user-select:none;transition:border-color .15s;min-width:0;}
    .tc-trigger:hover{border-color:#3b82f6;} .tc-trigger.open{background:#1e2d4a;border-color:#60a5fa;}
    .tc-trigger-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .tc-chevron{font-size:9px;color:#60a5fa;transition:transform .2s;flex-shrink:0;}
    .tc-trigger.open .tc-chevron{transform:rotate(180deg);}
    .tc-pulse{width:7px;height:7px;border-radius:50%;background:#3b82f6;box-shadow:0 0 6px #3b82f6;animation:tcPulse 2s infinite;flex-shrink:0;}
    @keyframes tcPulse{0%,100%{opacity:1}50%{opacity:.25}}
    .tc-uta-name{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#93c5fd;letter-spacing:.06em;}
    .tc-close{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#1a2035;border:1px solid #f43f5e;border-radius:8px;color:#94a3b8;cursor:pointer;transition:all .15s;font-size:13px;flex-shrink:0;}
    .tc-close:hover{background:#2d1f1f;color:#ef4444;}
    .tc-badge{display:inline-flex;align-items:center;gap:5px;border-radius:6px;padding:3px 9px;font-size:10px;letter-spacing:.05em;white-space:nowrap;flex-shrink:0;}
    .tc-badge-blue{background:#0f2030;border:1px solid #1e4060;color:#38bdf8;}
    .tc-badge-green{background:#12201a;border:1px solid #1a4030;color:#4ade80;}
    .tc-badge-amber{background:#1c1505;border:1px solid #44300a;color:#fbbf24;}
    .tc-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;animation:tcPulse 2s infinite;}
    .tc-timeline{position:relative;height:26px;background:#0d1525;border-radius:6px;border:1px solid #1e293b;overflow:hidden;flex-shrink:0;}
    .tc-timeline-fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#1e3a5f,#1e4060);transition:width .5s ease;}
    .tc-timeline-now{position:absolute;top:0;bottom:0;width:2px;background:#38bdf8;}
    .tc-timeline-lbl{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;color:#38bdf8;letter-spacing:.05em;white-space:nowrap;}
    .tc-info-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    .tc-stat{display:inline-flex;align-items:center;gap:5px;background:#0d1525;border:1px solid #1e2d4a;border-radius:6px;padding:3px 9px;font-size:10px;color:#64748b;white-space:nowrap;}
    .tc-stat strong{color:#94a3b8;}
    .tc-box{flex:1;background:#080d1a;border-radius:10px;border:1px solid #1a2235;display:flex;flex-direction:column;min-height:0;}
    .tc-boxhdr{display:flex;align-items:center;padding:8px 14px;border-bottom:1px solid #1a2235;flex-shrink:0;flex-wrap:wrap;gap:6px;}
    .tc-pills{display:flex;flex-wrap:wrap;gap:4px;align-items:center;flex:1;min-width:0;}
    .tc-pill-hint{font-size:10px;color:#334155;}
    .tc-pill{display:inline-flex;align-items:center;gap:4px;background:#0d1525;border:1px solid var(--pc);border-radius:20px;padding:2px 8px;font-size:10px;color:var(--pc);white-space:nowrap;}
    .tc-pill-dot{width:5px;height:5px;border-radius:50%;background:var(--pc);flex-shrink:0;}
    .tc-pill-rm{cursor:pointer;margin-left:2px;opacity:.6;transition:opacity .15s;font-size:8px;}
    .tc-pill-rm:hover{opacity:1;}
    .tc-chart{flex:1;padding:10px 12px 8px;min-height:0;}
    .tc-empty{flex:1;display:flex;align-items:center;justify-content:center;color:#2d3f5e;font-size:12px;}
    .tc-legend{display:flex;flex-wrap:wrap;gap:8px 14px;padding:8px 14px;border-top:1px solid #1a2235;flex-shrink:0;}
    .tc-leg-item{display:flex;align-items:center;gap:5px;font-size:10px;color:#64748b;}
    .tc-leg-sq{width:8px;height:8px;border-radius:2px;flex-shrink:0;}
    .tc-opt{display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:pointer;font-size:12px;font-family:'DM Mono',monospace;border-bottom:1px solid #1a2235;transition:background .1s;}
    .tc-opt:hover{background:#1a2035;}
    .tc-date-trigger{border-color:#2d3a1e !important;}
    .tc-date-trigger:hover{border-color:#4ade80 !important;}
    .tc-date-trigger.open{background:#182610 !important;border-color:#4ade80 !important;}
    .tc-date-name{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#4ade80;letter-spacing:.06em;}
    .tc-no-data{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#2d3f5e;font-size:12px;}
    .tc-no-data-icon{font-size:28px;opacity:.3;}
    @media(max-width:639px){
      .tc-toprow{gap:6px;}.tc-trigger{padding:6px 9px;font-size:11px;}.tc-badge{font-size:9px;padding:2px 7px;}
      .tc-boxhdr{padding:6px 10px;}.tc-chart{padding:6px 8px;}.tc-legend{padding:6px 10px;gap:6px 10px;}
    }
  `;

  const prog  = dayProgress();
  const nowHM = new Date().toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });

  const coverage = useMemo(() => {
    if (!firstTime || !lastTime) return null;
    const [fh, fm] = firstTime.split(":").map(Number);
    const [lh, lm] = lastTime.split(":").map(Number);
    const diff = (lh * 60 + lm) - (fh * 60 + fm);
    return diff >= 60 ? `${Math.floor(diff/60)}h ${diff%60}m` : `${diff}m`;
  }, [firstTime, lastTime]);

  const optColor = (active) => ({
    color:      active ? "#93c5fd" : "#64748b",
    background: active ? "#1a2a45" : "transparent",
  });

  const optColorDate = (active) => ({
    color:      active ? "#4ade80" : "#64748b",
    background: active ? "#182610" : "transparent",
  });

  return (
    <>
      <style>{css}</style>
      <div className="tc-wrap">

        {/* TOP ROW */}
        <div className="tc-toprow">

          {/* Param selector */}
          <div ref={paramTriggerRef} style={{ flex:1, maxWidth:300, minWidth:140 }}>
            <div className={`tc-trigger ${paramOpen ? "open" : ""}`}
              onClick={() => { const n=!paramOpen; setParamOpen(n); setUtaOpen(false); setDateOpen(false); if(n) recalcParam(); }}>
              <span className="tc-trigger-text">Shto parametër…</span>
              <FontAwesomeIcon icon={faChevronDown} className="tc-chevron" />
            </div>
          </div>

          {/* UTA selector */}
          <div ref={utaTriggerRef}>
            <div className={`tc-trigger ${utaOpen ? "open" : ""}`} style={{ borderColor:"#1e4060" }}
              onClick={() => { const n=!utaOpen; setUtaOpen(n); setParamOpen(false); setDateOpen(false); if(n) recalcUta(); }}>
              <div className="tc-pulse" />
              <span className="tc-uta-name">{chartUta?.id || "Zgjidh UTA"}</span>
              <FontAwesomeIcon icon={faChevronDown} className="tc-chevron" />
            </div>
          </div>

          {/* Data selector */}
          <div ref={dateTriggerRef}>
            <div className={`tc-trigger tc-date-trigger ${dateOpen ? "open" : ""}`}
              onClick={() => { const n=!dateOpen; setDateOpen(n); setParamOpen(false); setUtaOpen(false); if(n) recalcDate(); }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize:11, color:"#4ade80", flexShrink:0 }} />
              <span className="tc-date-name">{dateLabel}</span>
              <FontAwesomeIcon icon={faChevronDown} className="tc-chevron" style={{ color:"#4ade80" }} />
            </div>
          </div>

          {/* Badge dată completă */}
          <div className={`tc-badge ${isToday ? "tc-badge-green" : "tc-badge-amber"}`}>
            {isToday ? "📅" : "📆"} {todayLabelFull}
          </div>

          {todayPts.length > 0 && (
            <div className="tc-badge tc-badge-blue">
              <span className="tc-badge-dot" />
              {todayPts.length} / 288 pikë
            </div>
          )}

          {onClose && (
            <button className="tc-close" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* TIMELINE BAR — afișăm doar pentru azi */}
        {isToday && (
          <div className="tc-timeline" title={`Ora tani: ${nowHM}`}>
            <div className="tc-timeline-fill" style={{ width:`${prog}%` }} />
            <div className="tc-timeline-now"  style={{ left:`${prog}%` }} />
            <span className="tc-timeline-lbl">
              <FontAwesomeIcon icon={faClock} style={{ marginRight:4 }} />
              {nowHM}{lastTime && ` · last ${lastTime}`}
            </span>
          </div>
        )}

        {/* INFO STATS */}
        {todayPts.length > 0 && (
          <div className="tc-info-row">
            {firstTime  && <span className="tc-stat">start <strong>{firstTime}</strong></span>}
            {lastTime   && <span className="tc-stat">last  <strong>{lastTime}</strong></span>}
            {coverage   && <span className="tc-stat">Permbledhje <strong>{coverage}</strong></span>}
            <span className="tc-stat">interval <strong>5 min</strong></span>
            {!isToday && <span className="tc-stat">📆 <strong>{selectedDate}</strong></span>}
            {availableDates.length > 1 && (
              <span className="tc-stat">ditë ruajtura <strong>{availableDates.length}</strong></span>
            )}
          </div>
        )}

        {/* PORTALS */}
        <DropdownPortal isOpen={paramOpen} coords={paramCoords} minWidth={240} innerRef={paramDropRef}>
          {ALL_PARAMS.map(p => {
            const sel = selectedParams.includes(p.key);
            return (
              <div key={p.key} className="tc-opt" style={optColor(sel)} onClick={() => toggleParam(p.key)}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:p.color, flexShrink:0 }} />
                {p.label} ({p.unit})
                {sel && <FontAwesomeIcon icon={faCheck} style={{ fontSize:10, color:"#3b82f6", marginLeft:"auto" }} />}
              </div>
            );
          })}
        </DropdownPortal>

        <DropdownPortal isOpen={utaOpen} coords={utaCoords} minWidth={180} innerRef={utaDropRef}>
          {allUtas.map(uta => {
            const isAct    = chartUta?.id === uta.id;
            const sk       = (uta.status || "").toLowerCase();
            const dotColor = sk==="on" ? "#4ade80" : sk==="off" ? "#f87171" : "#64748b";
            const statusBg = sk==="on" ? "#14532d" : sk==="off" ? "#450a0a" : "#1e293b";
            const statusTx = sk==="on" ? "#4ade80" : sk==="off" ? "#f87171" : "#64748b";
            return (
              <div key={uta.id} className="tc-opt" style={optColor(isAct)}
                onClick={() => { setChartUta(uta); setUtaOpen(false); }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:dotColor, flexShrink:0 }} />
                {uta.id}
                {uta.status && (
                  <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:statusBg, color:statusTx, textTransform:"uppercase", letterSpacing:".06em", marginLeft:"auto" }}>
                    {uta.status}
                  </span>
                )}
                {isAct && <FontAwesomeIcon icon={faCheck} style={{ fontSize:10, color:"#3b82f6", marginLeft:"auto" }} />}
              </div>
            );
          })}
        </DropdownPortal>

        {/* Date dropdown portal */}
        <DropdownPortal isOpen={dateOpen} coords={dateCoords} minWidth={200} innerRef={dateDropRef}>
          {availableDates.length === 0 ? (
            <div className="tc-opt" style={{ color:"#334155", cursor:"default" }}>Nuk ka të dhëna</div>
          ) : availableDates.map(d => {
            const isAct = d === selectedDate;
            const lbl   = formatDateLabel(d, todayStr);
            const isT   = d === todayStr;
            return (
              <div key={d} className="tc-opt" style={optColorDate(isAct)}
                onClick={() => { setSelectedDate(d); setDateOpen(false); }}>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  style={{ fontSize:10, color: isT ? "#4ade80" : "#fbbf24", flexShrink:0 }}
                />
                <span style={{ flex:1 }}>{lbl}</span>
                <span style={{ fontSize:9, color:"#334155" }}>{d}</span>
                {isAct && <FontAwesomeIcon icon={faCheck} style={{ fontSize:10, color:"#4ade80" }} />}
              </div>
            );
          })}
        </DropdownPortal>

        {/* CHART BOX */}
        <div className="tc-box">
          <div className="tc-boxhdr">
            <div className="tc-pills">
              {selectedParams.length > 0
                ? ALL_PARAMS.filter(p => selectedParams.includes(p.key)).map(p => (
                    <span key={p.key} className="tc-pill" style={{ "--pc": p.color }}>
                      <span className="tc-pill-dot" />
                      {p.label}
                      <span className="tc-pill-rm" onClick={() => toggleParam(p.key)}>✕</span>
                    </span>
                  ))
                : <span className="tc-pill-hint">Zgjidh parametër nga lista sipër</span>
              }
            </div>
            <span style={{ fontSize:10, color:"#2d4060", whiteSpace:"nowrap" }}>{chartUta?.id}</span>
          </div>

          {selectedParams.length === 0 ? (
            <div className="tc-empty">Zgjidh të paktën një parametër ↑</div>
          ) : todayPts.length === 0 ? (
            <div className="tc-no-data">
              <span className="tc-no-data-icon">📭</span>
              <span>Nuk ka të dhëna për {dateLabel}</span>
            </div>
          ) : (
            <div className="tc-chart"><Line data={chartData} options={chartOptions} /></div>
          )}

          {selectedParams.length > 0 && todayPts.length > 0 && (
            <div className="tc-legend">
              {ALL_PARAMS.filter(p => selectedParams.includes(p.key)).map(p => (
                <span key={p.key} className="tc-leg-item">
                  <span className="tc-leg-sq" style={{ background: p.color }} />
                  {p.label} ({p.unit})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}