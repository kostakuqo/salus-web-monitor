import { useState, useEffect } from "react";
import { initialUtaData } from "../content/uta/uta data/utaData";


// ─── Canvas ────────────────────────────────────────────────────────────
const SVG_W = 1080;
const SVG_H = 380;

// ─── Two horizontal pipe levels ────────────────────────────────────────
// Aspirator is ON the return pipe level
// Ventilator is ON the supply pipe level
const RET_Y  = 110;   // return pipe  — Aspirator lives here
const SUP_Y  = 270;   // supply pipe  — Ventilator lives here

// ─── Left side: IN/OUT labels + Aspirator + Ventilator ────────────────
const LABEL_X = 18;   // "IN" / "OUT" text X
const ASP_X   = 120;  // Aspirator center X  (on RET_Y)
const VENT_X  = 120;  // Ventilator center X (on SUP_Y)

// ─── Cross section ─────────────────────────────────────────────────────
// Sits between the two pipes, centered on X=270
const CX      = 250;
const CX_HALF = 44;
const CX_L    = CX - CX_HALF;   // 226
const CX_R    = CX + CX_HALF;   // 314

// The cross box spans from just above RET_Y to just below SUP_Y
const CX_T    = RET_Y - 22;
const CX_B    = SUP_Y + 22;

// ─── Supply chain (right of cross section) ─────────────────────────────
const KALD_X     = 455;
const CHILL_X    = 590;
const SENT_X     = 750;
const RET_BOX_X  = 750;
const ROOM_X     = 900;
const ROOM_Y     = RET_Y - 50;
const ROOM_W     = 150;
const ROOM_H     = SUP_Y - ROOM_Y + 100;
const ROOM_MX    = ROOM_X + ROOM_W / 2;
const ROOM_MY    = ROOM_Y + ROOM_H / 2;
const MID_Y      = (RET_Y + SUP_Y) / 2;
const BADGE_Y    = SUP_Y + 30;  // temp badges below supply pipe

// ─── Helpers ──────────────────────────────────────────────────────────
function airColor(t) {
  if (t <= 0)  return "#88EEFF";
  if (t <= 8)  return "#00CCFF";
  if (t <= 18) return "#00FFCC";
  if (t <= 28) return "#FFAA00";
  return "#FF5533";
}

function FH({ x1, x2, y, on, col, n = 3, d = 1.5 }) {
  if (!on) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <circle key={i} r={3.5} fill={col} opacity={0.9}>
          <animateMotion dur={`${d + i*0.25}s`} begin={`${-(i*d/n)}s`}
            repeatCount="indefinite" path={`M${x1},${y} L${x2},${y}`}/>
        </circle>
      ))}
    </>
  );
}

function FV({ x, y1, y2, on, col, n = 3, d = 1.3 }) {
  if (!on) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <circle key={i} r={3.5} fill={col} opacity={0.9}>
          <animateMotion dur={`${d + i*0.25}s`} begin={`${-(i*d/n)}s`}
            repeatCount="indefinite" path={`M${x},${y1} L${x},${y2}`}/>
        </circle>
      ))}
    </>
  );
}

function Pulse({ cx, cy, r, col, on }) {
  if (!on) return null;
  return (
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={1.5} opacity={0}>
      <animate attributeName="r"       values={`${r};${r+12};${r}`} dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.45;0;0.45"          dur="2s" repeatCount="indefinite"/>
    </circle>
  );
}

function Blink({ x, y, on, col }) {
  return (
    <circle cx={x} cy={y} r={4} fill={on ? col : "#182018"}>
      {on && <animate attributeName="opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite"/>}
    </circle>
  );
}

function EBox({ cx, cy, w = 92, h = 48, label, sub, icon, on: active, col }) {
  return (
    <g>
      <Pulse cx={cx} cy={cy} r={w/2+5} col={col} on={active}/>
      {active && (
        <rect x={cx-w/2-3} y={cy-h/2-3} width={w+6} height={h+6} rx={10}
          fill={col} opacity={0.07}>
          <animate attributeName="opacity" values="0.07;0.15;0.07" dur="2s" repeatCount="indefinite"/>
        </rect>
      )}
      <rect x={cx-w/2} y={cy-h/2} width={w} height={h} rx={8}
        fill={active ? "#0B1C0B" : "#070D07"}
        stroke={active ? col : "#1A2A1A"} strokeWidth={active ? 1.5 : 1}
        style={{ transition:"stroke .3s, fill .3s" }}/>
      <rect x={cx-w/2} y={cy-h/2} width={w} height={3} rx={2}
        fill={active ? col : "#162016"} style={{ transition:"fill .3s" }}/>
      {icon && (
        <text x={cx} y={cy-6} textAnchor="middle" fontSize={13}
          fill={active ? col : "#2A3A2A"} style={{ transition:"fill .3s" }}>{icon}</text>
      )}
      <text x={cx} y={icon ? cy+6 : cy-2} textAnchor="middle"
        fontSize={9} fontWeight="700" letterSpacing="0.09em"
        fill={active ? col : "#2A3A2A"} style={{ transition:"fill .3s" }}>{label}</text>
      {sub && (
        <text x={cx} y={icon ? cy+18 : cy+11} textAnchor="middle"
          fontSize={7.5} fill={active ? "#AAFFAA" : "#1E2E1E"} letterSpacing="0.05em"
          style={{ transition:"fill .3s" }}>{sub}</text>
      )}
      <Blink x={cx+w/2-9} y={cy-h/2+9} on={active} col={col}/>
    </g>
  );
}

function SBox({ cx, cy, label, sub, on: active, col }) {
  const w = 64, h = 38;
  return (
    <g>
      {active && (
        <rect x={cx-w/2-2} y={cy-h/2-2} width={w+4} height={h+4} rx={8}
          fill={col} opacity={0.08}>
          <animate attributeName="opacity" values="0.08;0.17;0.08" dur="2s" repeatCount="indefinite"/>
        </rect>
      )}
      <rect x={cx-w/2} y={cy-h/2} width={w} height={h} rx={6}
        fill={active ? "#0B1C0B" : "#070D07"}
        stroke={active ? col : "#1A2A1A"} strokeWidth={active ? 1.5 : 1}
        style={{ transition:"stroke .3s, fill .3s" }}/>
      <rect x={cx-w/2} y={cy-h/2} width={w} height={3} rx={2}
        fill={active ? col : "#162016"} style={{ transition:"fill .3s" }}/>
      <text x={cx} y={cy-3} textAnchor="middle" fontSize={8.5} fontWeight="700"
        letterSpacing="0.09em" fill={active ? col : "#2A3A2A"}
        style={{ transition:"fill .3s" }}>{label}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={7.5}
        fill={active ? "#AAFFAA" : "#1E2E1E"} style={{ transition:"fill .3s" }}>{sub}</text>
      {active && (
        <circle cx={cx+24} cy={cy-h/2+9} r={4} fill={col}>
          <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/>
        </circle>
      )}
    </g>
  );
}

function TBadge({ x, y, temp, show }) {
  if (!show) return null;
  const c = airColor(temp);
  return (
    <g>
      <rect x={x-22} y={y-11} width={44} height={20} rx={4}
        fill="#040C04" stroke={c} strokeWidth={1.2}/>
      <text x={x} y={y+4} textAnchor="middle" fontSize={9.5} fontWeight="700" fill={c}>
        {temp}°C
      </text>
    </g>
  );
}

// ─── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [selId, setSelId] = useState(initialUtaData[0]?.id);
  const [tick, setTick]   = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t+1) % 2000), 50);
    return () => clearInterval(id);
  }, []);

  const d       = initialUtaData.find(u => u.id === selId) ?? initialUtaData[0];
  const aspOn   = d.status === "ON";
  const ventOn  = d.status === "ON";
  const kaldOn  = !!d.chiller?.kaldaja;
  const chillOn = d.chiller?.status === "ON";

  const T0 = d.chiller?.kaldaja?.tempSupply ?? -5;
  const T2 = kaldOn  ? (d.chiller?.kaldaja?.tempReturn ?? T0+14) : T0;
  const T3 = chillOn ? (d.chiller?.tempOut  ?? T2-10)            : T2;

  const sAsp   = aspOn;
  const sKald  = aspOn && kaldOn;
  const sChill = aspOn && kaldOn && chillOn;
  const sIn    = sChill;

  const anyOn = aspOn || ventOn || kaldOn || chillOn;
  const allOn = aspOn && ventOn && kaldOn && chillOn;
  const scanY = (tick * 3) % (SVG_H + 20) - 10;

  const lc = (a, t) => a ? airColor(t) : "#152015";
  const rc  = ventOn ? "#FF4455" : "#152015";
  const ra  = ventOn ? "#FF4455" : "#1E3A1E";

  const statusText  = allOn ? "ALL SYSTEMS ACTIVE" : anyOn ? "PARTIAL OPERATION" : "STANDBY";
  const statusColor = allOn ? "#00FF88" : anyOn ? "#FFAA00" : "#2A5A2A";

  return (
    <div style={{ fontFamily:"'Courier New', monospace", background:"#030B03",
      border:"1px solid #192019", padding:"1.25rem",
      width:"100%", maxWidth:"100%", boxSizing:"border-box" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:"1rem", borderBottom:"0.5px solid #192019" }}>
        <div>
          <div style={{ fontSize:8, color:"#2A5A2A", letterSpacing:"0.18em", marginBottom:4 }}>
            BMS · HVAC CONTROL
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:14, color:"#4AEE4A", letterSpacing:"0.1em", fontWeight:700 }}>
              {d.id}
            </div>
            <select value={selId} onChange={e => setSelId(e.target.value)} style={{
              background:"#091209", color:"#4AEE4A", border:"1px solid #1A4A1A",
              borderRadius:4, padding:"2px 8px", fontSize:9, fontFamily:"inherit",
              cursor:"pointer", outline:"none", letterSpacing:"0.06em" }}>
              {initialUtaData.map(u => (
                <option key={u.id} value={u.id}
                  style={{ background:"#091209", color: u.status==="ON" ? "#4AEE4A" : "#3A5A3A" }}>
                  {u.id}  [{u.status}]
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:8, color:"#2A4A2A", letterSpacing:"0.1em", marginBottom:4 }}>STATUS</div>
          <div style={{ fontSize:9, color:statusColor, letterSpacing:"0.12em", fontWeight:700,
            padding:"4px 12px", border:`1px solid ${statusColor}`, borderRadius:4,
            transition:"color .4s, border-color .4s" }}>
            {statusText}
            {anyOn && <span style={{ marginLeft:6, animation:"blink 1s infinite" }}>●</span>}
          </div>
        </div>
      </div>

      {/* Diagram */}
      <div style={{ position:"relative", background:"#050D05", borderRadius:10,
        border:"1px solid #162016", overflow:"hidden" }}>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%",
          pointerEvents:"none", opacity:0.04 }}>
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0 L0 0 0 24" fill="none" stroke="#00FF00" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>

        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display:"block" }}>
          <defs>
            <marker id="m-sup" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#00FFCC"/>
            </marker>
            <marker id="m-dim" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#152015"/>
            </marker>
          </defs>

          <rect x={0} y={scanY} width={SVG_W} height={3} fill="#00FF00" opacity={0.018}/>

          {/* ══════════════════════════════════════════════════════
              TOP ROW  — RETURN pipe — Aspirator (AIR IN)
          ══════════════════════════════════════════════════════ */}

          {/* "AIR IN" label far left */}
          <text x={LABEL_X} y={RET_Y + 4} textAnchor="start" fontSize={8} fontWeight="700"
            letterSpacing="0.1em" fill={sAsp ? airColor(T0) : "#1A3A1A"}
            style={{ transition:"fill .3s" }}>AIR IN ▶</text>

          {/* Outdoor temp badge */}
          <rect x={LABEL_X} y={RET_Y - 26} width={52} height={20} rx={4}
            fill="#040C04" stroke={airColor(T0)} strokeWidth={1.4}/>
          <text x={LABEL_X + 26} y={RET_Y - 11} textAnchor="middle"
            fontSize={10} fontWeight="700" fill={airColor(T0)}>{T0}°C</text>

          {/* Pipe from label → aspirator left edge */}
          <line x1={LABEL_X + 56} y1={RET_Y} x2={ASP_X - 50} y2={RET_Y}
            stroke={sAsp ? airColor(T0) : "#192019"} strokeWidth={2.5}
            style={{ transition:"stroke .3s" }}/>
          <FH x1={LABEL_X+58} x2={ASP_X-52} y={RET_Y}
            on={sAsp} col={airColor(T0)} n={2}/>

          {/* Aspirator — ON the return line */}
          <EBox cx={ASP_X} cy={RET_Y} label="ASPIRATOR" sub="SUPPLY" icon="⟳"
            on={aspOn} col="#00AAFF"/>

          {/* Pipe from aspirator right → CX_L at RET_Y */}
          <line x1={ASP_X+50} y1={RET_Y} x2={CX_L} y2={RET_Y}
            stroke={sAsp ? airColor(T0) : "#192019"} strokeWidth={2.5}
            style={{ transition:"stroke .3s" }}/>
          <FH x1={ASP_X+52} x2={CX_L} y={RET_Y}
            on={sAsp} col={airColor(T0)} n={2}/>

          {/* ══════════════════════════════════════════════════════
              CROSS SECTION — simple, clear
          ══════════════════════════════════════════════════════ */}

          {/* Background box */}
          <rect x={CX_L} y={CX_T} width={CX_HALF*2} height={CX_B-CX_T} rx={10}
            fill="#060E06" stroke={anyOn ? "#2A7A4A" : "#1A2A1A"} strokeWidth={1.5}
            style={{ transition:"stroke .4s" }}/>

          {/* Corner ticks */}
          {[[CX_L,CX_T],[CX_R,CX_T],[CX_L,CX_B],[CX_R,CX_B]].map(([x,y],i) => (
            <rect key={i} x={x-5} y={y-5} width={10} height={10}
              fill={anyOn ? "#2A7A4A" : "#1A2A1A"} rx={2}
              style={{ transition:"fill .4s" }}/>
          ))}

          {/* Label */}
          <text x={CX} y={CX_T - 8} textAnchor="middle" fontSize={7.5}
            fontWeight="700" letterSpacing="0.14em" fill="#2A7A4A">╳ CROSS</text>

          {/* ── Supply flow: enters from left at SUP_Y, exits right ── */}
          {/* Vertical left wall: from CX_T down to SUP_Y entry */}
          <line x1={CX_L} y1={CX_T} x2={CX_L} y2={SUP_Y}
            stroke={sAsp ? airColor(T0) : "#192019"} strokeWidth={2.5}
            style={{ transition:"stroke .3s" }}/>
          {/* Horizontal supply across box */}
          <line x1={CX_L} y1={SUP_Y} x2={CX_R} y2={SUP_Y}
            stroke={sAsp ? airColor(T0) : "#192019"} strokeWidth={2.5}
            style={{ transition:"stroke .3s" }}/>
          {/* Supply right-pointing arrow inside box */}
          <polygon
            points={`${CX_R-2},${SUP_Y} ${CX_R-14},${SUP_Y-8} ${CX_R-14},${SUP_Y+8}`}
            fill={sAsp ? airColor(T0) : "#1E3A1E"} style={{ transition:"fill .3s" }}/>

          {/* ── Return flow: enters from right at RET_Y, exits left ── */}
          {/* Horizontal return across box */}
          <line x1={CX_R} y1={RET_Y} x2={CX_L} y2={RET_Y}
            stroke={rc} strokeWidth={2.5} style={{ transition:"stroke .3s" }}/>
          {/* Vertical left wall: RET_Y down to CX_B */}
          <line x1={CX_L} y1={RET_Y} x2={CX_L} y2={CX_B}
            stroke={rc} strokeWidth={2.5} style={{ transition:"stroke .3s" }}/>
          {/* Return left-pointing arrow inside box */}
          <polygon
            points={`${CX_L+2},${RET_Y} ${CX_L+16},${RET_Y-8} ${CX_L+16},${RET_Y+8}`}
            fill={ra} style={{ transition:"fill .3s" }}/>

          {/* Bridge arc where supply vertical pipe crosses return horizontal */}
          <rect x={CX_L-16} y={RET_Y-8} width={32} height={16} fill="#060E06"/>
          <path d={`M${CX_L-14},${RET_Y} A14,14 0 0,0 ${CX_L+14},${RET_Y}`}
            fill="none" stroke={sAsp ? airColor(T0) : "#1E3A1E"} strokeWidth={2.5}
            style={{ transition:"stroke .3s" }}/>
          <line x1={CX_L} y1={RET_Y+15} x2={CX_L} y2={CX_B-2}
            stroke={rc} strokeWidth={2.5} style={{ transition:"stroke .3s" }}/>

          {/* Flow direction labels inside box */}
          <text x={CX} y={SUP_Y - 12} textAnchor="middle" fontSize={7}
            fill={sAsp ? airColor(T0) : "#1E3A1E"} style={{ transition:"fill .3s" }}>
            SUPPLY ▶
          </text>
          <text x={CX} y={RET_Y + 20} textAnchor="middle" fontSize={7}
            fill={ra} style={{ transition:"fill .3s" }}>
            ◀ RETURN
          </text>

          {/* Particles inside cross */}
          <FH x1={CX_L+4} x2={CX_R-4} y={SUP_Y} on={sAsp} col={airColor(T0)} n={2}/>
          <FH x1={CX_R-4} x2={CX_L+4} y={RET_Y} on={ventOn} col="#FF4455" n={2}/>

          {/* Supply exits cross right */}
          <line x1={CX_R} y1={SUP_Y} x2={CX_R+55} y2={SUP_Y}
            stroke={sAsp ? airColor(T0) : "#152015"} strokeWidth={2.5}
            strokeDasharray="5 3" style={{ transition:"stroke .3s" }}/>

          {/* Return enters cross from right — left-arrow stub */}
          <line x1={CX_R+57} y1={RET_Y} x2={CX_R+16} y2={RET_Y}
            stroke={rc} strokeWidth={2} strokeDasharray="5 3"
            style={{ transition:"stroke .3s" }}/>
          <polygon points={`${CX_R+2},${RET_Y} ${CX_R+16},${RET_Y-8} ${CX_R+16},${RET_Y+8}`}
            fill={ra} style={{ transition:"fill .3s" }}/>

          {/* ══════════════════════════════════════════════════════
              BOTTOM ROW — SUPPLY pipe — Ventilator (AIR OUT)
          ══════════════════════════════════════════════════════ */}

          {/* Pipe from CX_B bottom → horizontal to ventilator */}
          <line x1={CX_L} y1={CX_B} x2={CX_L} y2={SUP_Y}
            stroke={rc} strokeWidth={2.5} style={{ transition:"stroke .3s" }}/>

          {/* Pipe from cross left to ventilator right edge */}
          <line x1={CX_L} y1={SUP_Y} x2={VENT_X+50} y2={SUP_Y}
            stroke={rc} strokeWidth={2.5} style={{ transition:"stroke .3s" }}/>
          <FH x1={CX_L-4} x2={VENT_X+52} y={SUP_Y} on={ventOn} col="#FF4455" n={2}/>

          {/* Ventilator — ON the supply line */}
          <EBox cx={VENT_X} cy={SUP_Y} label="VENTILATOR" sub="EXHAUST" icon="⟳"
            on={ventOn} col="#FF4455"/>

          {/* Pipe from ventilator left → exhaust label */}
          <line x1={VENT_X-50} y1={SUP_Y} x2={LABEL_X+56} y2={SUP_Y}
            stroke={rc} strokeWidth={2.5} style={{ transition:"stroke .3s" }}/>
          <FH x1={VENT_X-52} x2={LABEL_X+58} y={SUP_Y} on={ventOn} col="#FF4455" n={2}/>

          {/* "AIR OUT" label far left */}
          <text x={LABEL_X} y={SUP_Y + 4} textAnchor="start" fontSize={8} fontWeight="700"
            letterSpacing="0.1em" fill={ventOn ? "#FF4455" : "#1A3A1A"}
            style={{ transition:"fill .3s" }}>◀ AIR OUT</text>

          {/* ══════════════════════════════════════════════════════
              SUPPLY CHAIN → right side
          ══════════════════════════════════════════════════════ */}

          <text x={CX_R+6} y={SUP_Y+22} fontSize={8} fontWeight="700"
            letterSpacing="0.1em" fill={sAsp ? airColor(T0) : "#1A2A1A"}
            style={{ transition:"fill .3s" }}>▶ SUPPLY</text>
          <text x={CX_R+6} y={RET_Y-12} fontSize={8} fontWeight="700"
            letterSpacing="0.1em" fill={ventOn ? "#FF4455" : "#1A2A1A"}
            style={{ transition:"fill .3s" }}>◀ RETURN</text>

          {/* stub → kaldaja */}
          <line x1={CX_R+55} y1={SUP_Y} x2={KALD_X-50} y2={SUP_Y}
            stroke={lc(sAsp,T0)} strokeWidth={2} strokeDasharray="5 3"
            style={{ transition:"stroke .3s" }}/>
          {/* kaldaja → chiller */}
          <line x1={KALD_X+50} y1={SUP_Y} x2={CHILL_X-50} y2={SUP_Y}
            stroke={lc(sKald,T2)} strokeWidth={2} strokeDasharray="5 3"
            style={{ transition:"stroke .3s" }}/>
          {/* chiller → sent */}
          <line x1={CHILL_X+50} y1={SUP_Y} x2={SENT_X-36} y2={SUP_Y}
            stroke={lc(sChill,T3)} strokeWidth={2} strokeDasharray="5 3"
            style={{ transition:"stroke .3s" }}/>
          {/* sent → room */}
          <line x1={SENT_X+36} y1={SUP_Y} x2={ROOM_X} y2={SUP_Y}
            stroke={lc(sChill,T3)} strokeWidth={2} strokeDasharray="5 3"
            markerEnd={sChill ? "url(#m-sup)" : "url(#m-dim)"}
            style={{ transition:"stroke .3s" }}/>

          <FH x1={CX_R+57} x2={KALD_X-50} y={SUP_Y} on={sAsp} col={airColor(T0)} n={2}/>
          <FH x1={KALD_X+50} x2={CHILL_X-50} y={SUP_Y} on={sKald} col={airColor(T2)} n={2}/>
          <FH x1={CHILL_X+50} x2={SENT_X-38} y={SUP_Y} on={sChill} col={airColor(T3)} n={2}/>
          <FH x1={SENT_X+38} x2={ROOM_X-4} y={SUP_Y} on={sIn} col={airColor(T3)} n={2}/>

          {/* Temp badges — clearly below supply pipe */}
          <TBadge x={(CX_R+55+KALD_X-50)/2}    y={BADGE_Y} temp={T0} show={sAsp}/>
          <TBadge x={(KALD_X+50+CHILL_X-50)/2} y={BADGE_Y} temp={T2} show={sKald}/>
          <TBadge x={(CHILL_X+50+SENT_X-36)/2} y={BADGE_Y} temp={T3} show={sChill}/>

          {/* Effect annotations between the two pipes */}
          {kaldOn && (
            <g>
              <line x1={KALD_X} y1={SUP_Y-30} x2={KALD_X} y2={MID_Y+8}
                stroke="#FF8800" strokeWidth={1} strokeDasharray="3 2"/>
              <text x={KALD_X} y={MID_Y-4} textAnchor="middle" fontSize={9.5} fill="#FF8800">
                +{Math.round(T2-T0)}°C
              </text>
            </g>
          )}
          {chillOn && (
            <g>
              <line x1={CHILL_X} y1={SUP_Y-30} x2={CHILL_X} y2={MID_Y+8}
                stroke="#00CCFF" strokeWidth={1} strokeDasharray="3 2"/>
              <text x={CHILL_X} y={MID_Y-4} textAnchor="middle" fontSize={9.5} fill="#00CCFF">
                {Math.round(T3-T2)}°C
              </text>
            </g>
          )}

          {/* SENT box */}
          <SBox cx={SENT_X} cy={SUP_Y} label="SENT" sub="AIR IN" on={sIn} col="#00FFCC"/>

          {/* Equipment on supply */}
          <EBox cx={KALD_X} cy={SUP_Y} label="KALDAJA" sub="HEATER" icon="▲"
            on={kaldOn} col="#FF8800"/>
          <EBox cx={CHILL_X} cy={SUP_Y} label="CHILLER" sub="COOLING" icon="❄"
            on={chillOn} col="#00CCFF"/>

          {/* ══════════════════════════════════════════════════════
              RETURN CHAIN ← right side
          ══════════════════════════════════════════════════════ */}

          {/* Room wrap-around to RET_Y */}
          <line x1={ROOM_X+ROOM_W} y1={ROOM_MY} x2={ROOM_X+ROOM_W+22} y2={ROOM_MY}
            stroke={rc} strokeWidth={2} style={{ transition:"stroke .3s" }}/>
          <line x1={ROOM_X+ROOM_W+22} y1={ROOM_MY} x2={ROOM_X+ROOM_W+22} y2={RET_Y}
            stroke={rc} strokeWidth={2} style={{ transition:"stroke .3s" }}/>
          <line x1={ROOM_X+ROOM_W+22} y1={RET_Y} x2={ROOM_X+ROOM_W} y2={RET_Y}
            stroke={rc} strokeWidth={2} style={{ transition:"stroke .3s" }}/>

          {/* room → RETURN box */}
          <line x1={ROOM_X} y1={RET_Y} x2={RET_BOX_X+36} y2={RET_Y}
            stroke={rc} strokeWidth={2} strokeDasharray="5 3"
            style={{ transition:"stroke .3s" }}/>

          {/* RETURN box */}
          <SBox cx={RET_BOX_X} cy={RET_Y} label="RETURN" sub="AIR OUT" on={ventOn} col="#FF4455"/>

          {/* RETURN box → cross right */}
          <line x1={RET_BOX_X-36} y1={RET_Y} x2={CX_R+59} y2={RET_Y}
            stroke={rc} strokeWidth={2} strokeDasharray="5 3"
            style={{ transition:"stroke .3s" }}/>

          <FH x1={ROOM_X+ROOM_W} x2={RET_BOX_X+34} y={RET_Y} on={ventOn} col="#FF4455" n={2}/>
          <FH x1={RET_BOX_X-38} x2={CX_R+60} y={RET_Y} on={ventOn} col="#FF4455" n={3}/>

          {/* ΔP connector */}
          {(() => {
            const PX   = SENT_X - 62;
            const py1  = RET_Y + 20;
            const py2  = SUP_Y - 22;
            const pmid = (py1 + py2) / 2;
            const act  = sIn && ventOn;
            const col  = act ? "#FFAA00" : "#1E3A1E";
            return (
              <g>
                <line x1={PX} y1={py1} x2={PX} y2={py2}
                  stroke={col} strokeWidth={1.5} strokeDasharray="4 3"
                  style={{ transition:"stroke .3s" }}/>
                <line x1={PX-7} y1={py1} x2={PX+7} y2={py1}
                  stroke={col} strokeWidth={1.5} style={{ transition:"stroke .3s" }}/>
                <line x1={PX-7} y1={py2} x2={PX+7} y2={py2}
                  stroke={col} strokeWidth={1.5} style={{ transition:"stroke .3s" }}/>
                <polygon points={`${PX},${py2} ${PX-5},${py2+11} ${PX+5},${py2+11}`}
                  fill={col} style={{ transition:"fill .3s" }}/>
                <polygon points={`${PX},${py1} ${PX-5},${py1-11} ${PX+5},${py1-11}`}
                  fill={col} style={{ transition:"fill .3s" }}/>
                <rect x={PX-20} y={pmid-14} width={40} height={28} rx={4}
                  fill="#040C04" stroke={col} strokeWidth={1}
                  style={{ transition:"stroke .3s" }}/>
                <text x={PX} y={pmid-1} textAnchor="middle" fontSize={9}
                  fontWeight="700" fill={col} style={{ transition:"fill .3s" }}>ΔP</text>
                <text x={PX} y={pmid+12} textAnchor="middle" fontSize={7.5}
                  fill={col} style={{ transition:"fill .3s" }}>
                  {act ? `${d.pressure} bar` : "Pa"}
                </text>
              </g>
            );
          })()}

          {/* ══════════════════════════════════════════════════════
              ROOM
          ══════════════════════════════════════════════════════ */}
          <rect x={ROOM_X} y={ROOM_Y} width={ROOM_W} height={ROOM_H} rx={9}
            fill="#060E06" stroke={anyOn ? "#1A6A3A" : "#152015"} strokeWidth={1.5}
            style={{ transition:"stroke .4s" }}/>
          {[[ROOM_X,ROOM_Y],[ROOM_X+ROOM_W,ROOM_Y],
            [ROOM_X,ROOM_Y+ROOM_H],[ROOM_X+ROOM_W,ROOM_Y+ROOM_H]].map(([x,y],i)=>(
            <rect key={i} x={x-5} y={y-5} width={10} height={10}
              fill={anyOn ? "#1A6A3A" : "#152015"} rx={2} style={{ transition:"fill .4s" }}/>
          ))}
          <text x={ROOM_MX} y={ROOM_MY-16} textAnchor="middle" fontSize={10}
            fontWeight="700" letterSpacing="0.1em"
            fill={anyOn ? "#4AEE4A" : "#1E4A1E"} style={{ transition:"fill .4s" }}>ROOM</text>
          <text x={ROOM_MX} y={ROOM_MY} textAnchor="middle" fontSize={8.5}
            fill={anyOn ? "#2A8A2A" : "#152015"} style={{ transition:"fill .4s" }}>FLOOR 1</text>
          {sIn && (
            <text x={ROOM_MX} y={ROOM_MY+18} textAnchor="middle"
              fontSize={13} fontWeight="700" fill={airColor(T3)}>{T3}°C</text>
          )}
          {sIn && (
            <>
              <path d={`M${ROOM_X+18},${ROOM_MY-20} Q${ROOM_MX},${ROOM_Y+14} ${ROOM_X+ROOM_W-18},${ROOM_MY-20}`}
                fill="none" stroke={airColor(T3)} strokeWidth={1} strokeDasharray="3 2" opacity={0.45}/>
              <path d={`M${ROOM_X+ROOM_W-18},${ROOM_MY+20} Q${ROOM_MX},${ROOM_Y+ROOM_H-14} ${ROOM_X+18},${ROOM_MY+20}`}
                fill="none" stroke={airColor(T3)} strokeWidth={1} strokeDasharray="3 2" opacity={0.45}/>
            </>
          )}
          {allOn && (
            <rect x={ROOM_X} y={ROOM_Y} width={ROOM_W} height={ROOM_H} rx={9}
              fill="none" stroke="#00FF88" strokeWidth={2} opacity={0}>
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="stroke-width" values="2;6;2" dur="2.5s" repeatCount="indefinite"/>
            </rect>
          )}
          <line x1={ROOM_X} y1={SUP_Y} x2={ROOM_X} y2={ROOM_Y+ROOM_H}
            stroke={lc(sChill,T3)} strokeWidth={2} style={{ transition:"stroke .3s" }}/>

        </svg>
      </div>

      {/* Live data cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:"1rem" }}>
        {[
          { label:d.id, col:"#00AAFF", active:aspOn, rows:[
            {k:"Supply air", v:`${d.tempAirSupply}°C`},
            {k:"Return air", v:`${d.tempReturn}°C`},
            {k:"Pressure",   v:`${d.pressure} bar`},
            {k:"Inv supply", v:`${d.inverterAirSupply}%`},
            {k:"Inv return", v:`${d.inverterAirReturn}%`},
          ]},
          { label:d.chiller?.id ?? "CHILLER", col:"#00CCFF", active:chillOn, rows:[
            {k:"Temp in",  v:`${d.chiller?.tempIn}°C`},
            {k:"Temp out", v:`${d.chiller?.tempOut}°C`},
            {k:"Pressure", v:`${d.chiller?.pressure} bar`},
          ]},
          { label:d.chiller?.kaldaja?.id ?? "KALDAJA", col:"#FF8800", active:kaldOn, rows:[
            {k:"Temp supply", v:`${d.chiller?.kaldaja?.tempSupply}°C`},
            {k:"Temp return", v:`${d.chiller?.kaldaja?.tempReturn}°C`},
          ]},
          { label:d.chiller?.kaldaja?.inverter?.id ?? "INVERTER", col:"#FFAA00", active:kaldOn, rows:[
            {k:"Power", v:`${d.chiller?.kaldaja?.inverter?.power}%`},
          ]},
        ].map(({ label, col, active, rows }) => (
          <div key={label} style={{ background: active ? "#0B1C0B" : "#070D07",
            border:`1px solid ${active ? col : "#1A2A1A"}`, borderRadius:10,
            padding:"10px 12px", transition:"border-color .3s, background .3s" }}>
            <div style={{ fontSize:7.5, color: active ? col : "#2A3A2A", letterSpacing:"0.1em",
              fontWeight:700, marginBottom:7,
              borderBottom:`0.5px solid ${active ? col+"44" : "#1A2A1A"}`,
              paddingBottom:5 }}>{label}</div>
            {rows.map(({k,v}) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:7.5, color:"#2A5A2A", letterSpacing:"0.05em" }}>{k}</span>
                <span style={{ fontSize:9, fontWeight:700, color: active ? col : "#2A3A2A" }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:"50%",
                background: active ? col : "#1A2A1A",
                boxShadow: active ? `0 0 6px ${col}55` : "none" }}/>
              <span style={{ fontSize:7, color: active ? "#AAFFAA" : "#1E3E1E",
                letterSpacing:"0.1em" }}>{active ? "ACTIVE" : "STANDBY"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginTop:"0.8rem", paddingTop:"0.6rem",
        borderTop:"0.5px solid #162016", flexWrap:"wrap" }}>
        {[
          {col:"#88EEFF", label:"VERY COLD <0°C"},
          {col:"#00CCFF", label:"COLD ≤8°C"},
          {col:"#00FFCC", label:"COOL ≤18°C"},
          {col:"#FFAA00", label:"WARM ≤28°C"},
          {col:"#FF4455", label:"RETURN"},
          {col:"#2A7A4A", label:"CROSS SECTION"},
        ].map(({col, label}) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:20, height:2, background:col, borderRadius:1 }}/>
            <span style={{ fontSize:7.5, color:"#2A5A2A", letterSpacing:"0.09em" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}