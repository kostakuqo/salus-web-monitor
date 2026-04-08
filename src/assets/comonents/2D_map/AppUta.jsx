import { useState, useCallback } from "react";
import { useUta } from "../../../services/UtaProvider"

function airColor(t) {
  if (t <= 0) return "#88EEFF";
  if (t <= 10) return "#00CCFF";
  if (t <= 20) return "#00E5CC";
  if (t <= 28) return "#FFAA00";
  return "#FF5533";
}

const C = {
  SUP: "#00E5FF", RET: "#FF8C00", BOIL: "#FF6B00", CHILL: "#0099FF",
  EDGE: "#2E4050", TEXT: "#8AABB8", HEAD: "#C8E8F0",
  PLATE: "#232F38", STEEL: "#1C2830", DIM: "#2A3A3A",
  OK: "#00FF88", WARN: "#FFD700",
};

const TOOLTIPS = {
  ASPIRATOR: { title: "ASPIRATOR", desc: "Ventilator kthimi — thith ajrin e kthyer nga hapësirat dhe e dërgon nëpër HEX. Shpejtësia kontrollohet nga inverteri (0–100 %)." },
  VENTILATOR: { title: "VENTILATOR", desc: "Ventilator furnizimi — shpërndan ajrin e trajtuar drejt hapësirave. Funksionon në sinkron me Aspiratorin." },
  BOILER_COIL: { title: "KALORIFER (Boiler)", desc: "Shkëmbyes nxehtësie ujë-ajër për ngrohje. Uji i nxehtë nga kaldaja rrjedh nëpër lamela dhe ngroh ajrin e furnizimit." },
  CHILLER_COIL: { title: "FTOHËS (Chiller)", desc: "Shkëmbyes nxehtësie ujë-ajër për ftohje. Uji i ftohtë nga chiller-i largon nxehtësinë nga ajri i furnizimit." },
  HEX: { title: "HEX — Shkëmbyes Rrotullues", desc: "Rekuperator nxehtësie midis ajrit të freskët hyrës dhe ajrit të kthimit. Kursen energji duke ngrohur/ftohur ajrin e jashtëm." },
  FILTER_F3: { title: "FILTERI F3", desc: "Filtër final i ajrit të furnizimit (klasa F7/F9). Largon grimcat e imëta para se ajri të hyjë në hapësira." },
  DP: { title: "ΔP — Presioni Diferencial", desc: "Senzor presioni diferencial midis kanalit të furnizimit dhe kthimit. Monitoron ekuilibrin hidraulik të sistemit." },
  HYRJA: { title: "HYRJA — Ajri i Freskët", desc: "Pika e hyrjes së ajrit të jashtëm në njësi. Temperatura matet këtu për të vlerësuar kushtet e jashtme." },
  DALJA: { title: "DALJA — Ajri i Kthimit", desc: "Pika e daljes së ajrit të kthimit drejt jashtë (evakuim). Kalon nëpër HEX para se të largohet." },
  BOILER_PUMP: { title: "POMPA — Qarkullimi Kaldajës", desc: "Pompë qarkullimi e ujit të nxehtë. Raporti i shpejtësisë (%) kontrollohet nga inverteri VFD për kursim energjie." },
  CHILLER_PUMP: { title: "POMPA — Qarkullimi Chiller", desc: "Pompë qarkullimi e ujit të ftohtë. Raporti i shpejtësisë (%) kontrollohet nga inverteri VFD për kursim energjie." },
  BOILER_VALVE: { title: "VALVULA — Kaldaja", desc: "Valvulë moduluese me 2/3 rrugë për rregullimin e rrjedhës së ujit të nxehtë. 0 % = mbyllur, 100 % = plotësisht hapur." },
  CHILLER_VALVE: { title: "VALVULA — Chiller", desc: "Valvulë moduluese me 2/3 rrugë për rregullimin e rrjedhës së ujit të ftohtë. 0 % = mbyllur, 100 % = plotësisht hapur." },
  DAMPER_IN: { title: "DAMPER HYRJE (D-IN)", desc: "Kllapë rregullimi e ajrit të freskët hyrës. Kontrollon sasinë e ajrit të jashtëm që futet në njësi (0–100 %)." },
  DAMPER_OUT: { title: "DAMPER DALJE (D-OUT)", desc: "Kllapë rregullimi e ajrit të kthimit. Kontrollon rrjedhën e ajrit të evakuuar drejt jashtë (0–100 %)." },
  KTHIMI: { title: "KTHIMI — Temperatura Kthimit", desc: "Temperatura e ajrit të kthyer nga hapësirat. Vlera tregon sa ngrohje/ftohje është absorbuar nga hapësirat." },
  DERGIMI: { title: "DËRGIMI — Temperatura Furnizimit", desc: "Temperatura e ajrit të trajtuar që dërgon njësia drejt hapësirave. Parametër kyç për rehatinë e ambientit." },
  ROOM: { title: "ROOM — Hapësira e Kondicionuar", desc: "Zona e kondicionuar e ndërtesës. Temperatura e treguar është vlera e furnizimit aktual drejt hapësirës." },
};

function SvgTooltip({ x, y, tipKey, vw }) {
  if (!tipKey) return null;
  const tip = TOOLTIPS[tipKey];
  if (!tip) return null;
  const W = 200, H = 68;
  let tx = x - W / 2;
  if (tx < 8) tx = 8;
  if (tx + W > vw - 8) tx = vw - W - 8;
  const ty = y - H - 14;
  return (
    <g style={{ pointerEvents: "none" }}>
      <polygon points={`${x},${y - 10} ${x - 7},${y - 18} ${x + 7},${y - 18}`}
        fill="#0d1526" stroke="#3b82f6" strokeWidth={1} />
      <foreignObject x={tx} y={ty < 4 ? y + 14 : ty} width={W} height={H + 20}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          background: "#0d1526", border: "1px solid #3b82f6", borderRadius: 8,
          padding: "7px 11px", fontFamily: "'Courier New', monospace",
          boxShadow: "0 8px 28px rgba(0,0,0,.7)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#60a5fa", letterSpacing: ".1em", marginBottom: 4 }}>
            {tip.title}
          </div>
          <div style={{ fontSize: 8, color: "#94a3b8", lineHeight: 1.5 }}>{tip.desc}</div>
        </div>
      </foreignObject>
    </g>
  );
}

function HoverZone({ x, y, w, h, tipKey, onHover }) {
  return (
    <rect x={x} y={y} width={w} height={h} fill="transparent" style={{ cursor: "help" }}
      onMouseEnter={() => onHover(tipKey, x + w / 2, y)}
      onMouseLeave={() => onHover(null, 0, 0)} />
  );
}

function ValBadge({ x, y, value, unit, col, small = false }) {
  const fs = small ? 8 : 10;
  const str = `${value} ${unit}`;
  const bw = str.length * (small ? 5.4 : 6.2) + 14;
  return (
    <g>
      <rect x={x - bw / 2} y={y - 12} width={bw} height={22} rx={3} fill={C.STEEL} stroke={col} strokeWidth={1} />
      <text x={x} y={y + 6} textAnchor="middle" fontSize={fs} fontWeight="700" fill={col}
        letterSpacing=".03em" fontFamily="'Courier New',monospace">{str}</text>
    </g>
  );
}

function Dot({ x, y, col, active }) {
  return active ? (
    <g>
      <circle cx={x} cy={y} r={5} fill={col + "33"} stroke={col} strokeWidth={1.5}>
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={3} fill={col} />
    </g>
  ) : (
    <g>
      <circle cx={x} cy={y} r={5} fill="none" stroke="#3A4A4A" strokeWidth={1.5} />
      <circle cx={x} cy={y} r={3} fill={C.DIM} />
    </g>
  );
}

function Pipe({ x1, y1, x2, y2, active, col, w = 3, dash = "" }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={active ? col : C.DIM} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" />;
}

function FlowLine({ x1, y1, x2, y2, active, col }) {
  if (!active) return null;
  const dur = (Math.hypot(x2 - x1, y2 - y1) / 80).toFixed(1);
  const path = `M${x1},${y1} L${x2},${y2}`;
  return (
    <>
      {[0, 1, 2].map(i => (
        <circle key={i} r={4} fill={col} opacity={0.9}>
          <animateMotion dur={`${dur}s`} begin={`${-(i * parseFloat(dur) / 3).toFixed(2)}s`}
            repeatCount="indefinite" path={path} />
        </circle>
      ))}
    </>
  );
}

function Fan({ cx, cy, r = 28, active, col }) {
  const blades = Array.from({ length: 6 }).map((_, i) => {
    const a = (i * 60) * Math.PI / 180, a2 = (i * 60 + 35) * Math.PI / 180;
    const ix = cx + 6 * Math.cos(a), iy = cy + 6 * Math.sin(a);
    const ox = cx + (r - 3) * Math.cos(a), oy = cy + (r - 3) * Math.sin(a);
    const mx = cx + (r - 8) * Math.cos(a2), my = cy + (r - 8) * Math.sin(a2);
    return `M${ix.toFixed(1)},${iy.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ox.toFixed(1)},${oy.toFixed(1)}`;
  }).join(" ");
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 6} fill={C.PLATE} stroke={active ? col + "88" : C.EDGE} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r + 2} fill={C.STEEL} />
      <g stroke={active ? col : C.DIM} strokeWidth={2.5} fill="none">
        <path d={blades}>
          {active && <animateTransform attributeName="transform" type="rotate"
            values={`0 ${cx} ${cy};360 ${cx} ${cy}`} dur="1.4s" repeatCount="indefinite" />}
        </path>
      </g>
      <circle cx={cx} cy={cy} r={7} fill={C.PLATE} stroke={active ? col : C.EDGE} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={3} fill={active ? col : C.DIM} />
      {active && <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={col} strokeWidth={1} opacity={0}>
        <animate attributeName="opacity" values=".4;0;.4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values={`${r + 6};${r + 14};${r + 6}`} dur="2s" repeatCount="indefinite" />
      </circle>}
    </g>
  );
}

function Coil({ x, y, w, h, active, col }) {
  const lines = [];
  for (let i = 8; i < w - 7; i += 9)
    lines.push(<line key={i} x1={x + i} y1={y - h / 2 + 5} x2={x + i} y2={y + h / 2 - 5}
      stroke={active ? col : C.DIM} strokeWidth={2.5} />);
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={3}
        fill={C.PLATE} stroke={active ? col + "88" : C.EDGE} strokeWidth={1.5} />
      {lines}
      <line x1={x + 5} y1={y - h / 2 + 5} x2={x + w - 5} y2={y - h / 2 + 5} stroke={active ? col : C.DIM} strokeWidth={1} opacity={.5} />
      <line x1={x + 5} y1={y + h / 2 - 5} x2={x + w - 5} y2={y + h / 2 - 5} stroke={active ? col : C.DIM} strokeWidth={1} opacity={.5} />
    </g>
  );
}

function Filter({ x, y, w, h, active, col }) {
  const lines = [];
  for (let i = 6; i < h - 4; i += 7)
    lines.push(<line key={i} x1={x + 4} y1={y - h / 2 + i} x2={x + w - 4} y2={y - h / 2 + i}
      stroke={active ? col : C.DIM} strokeWidth={1.5} opacity={.8} />);
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={3}
        fill={C.PLATE} stroke={active ? col : C.EDGE} strokeWidth={1.5} />
      {lines}
    </g>
  );
}

function Damper({ x, y, w, h, pct, active, col }) {
  const bladeH = (h - 8) * (pct / 100);
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={3}
        fill={C.STEEL} stroke={active ? col : C.EDGE} strokeWidth={1.5} />
      <rect x={x + 3} y={y - h / 2 + 4} width={w - 6} height={bladeH} rx={2}
        fill={active ? col + "44" : C.DIM} />
      <line x1={x} y1={y} x2={x + w} y2={y}
        stroke={active ? col : C.DIM} strokeWidth={1} opacity={.5} strokeDasharray="3 2" />
    </g>
  );
}

function WaterValve({ cx, cy, r = 10, pct, active, col }) {
  const openAngle = (pct / 100) * 80;
  const rad = a => (a - 90) * Math.PI / 180;
  const arcR = r - 3;
  const ax1 = cx + arcR * Math.cos(rad(-openAngle / 2));
  const ay1 = cy + arcR * Math.sin(rad(-openAngle / 2));
  const ax2 = cx + arcR * Math.cos(rad(openAngle / 2));
  const ay2 = cy + arcR * Math.sin(rad(openAngle / 2));
  const stemH = r + 1;
  return (
    <g>
      <polygon points={`${cx - r},${cy - r} ${cx},${cy} ${cx - r},${cy + r}`}
        fill={active ? col + "33" : C.DIM} stroke={active ? col : C.EDGE} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={`${cx + r},${cy - r} ${cx},${cy} ${cx + r},${cy + r}`}
        fill={active ? col + "33" : C.DIM} stroke={active ? col : C.EDGE} strokeWidth={1.5} strokeLinejoin="round" />
      {pct > 0 && <path
        d={`M${cx},${cy} L${ax1.toFixed(1)},${ay1.toFixed(1)} A${arcR},${arcR} 0 ${openAngle > 180 ? 1 : 0},1 ${ax2.toFixed(1)},${ay2.toFixed(1)} Z`}
        fill={active ? col + "55" : C.DIM} stroke="none" />}
      <circle cx={cx} cy={cy} r={2.5} fill={active ? col : C.EDGE} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy - r - stemH} stroke={active ? col : C.EDGE} strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy - r - stemH} r={5} fill={C.STEEL} stroke={active ? col : C.EDGE} strokeWidth={1.5} />
      <line x1={cx - 5} y1={cy - r - stemH} x2={cx + 5} y2={cy - r - stemH} stroke={active ? col : C.EDGE} strokeWidth={1.5} />
      <line x1={cx} y1={cy - r - stemH - 5} x2={cx} y2={cy - r - stemH + 5} stroke={active ? col : C.EDGE} strokeWidth={1.5} />
      <ValBadge x={cx} y={cy + r + 18} value={pct} unit="%" col={active ? col : C.DIM} small />
    </g>
  );
}

function PumpDevice({ cx, cy, r = 11, active, col, pct, label }) {
  const boxW = r * 2 + 36; const boxH = r * 2 + 28;
  const bx = cx - boxW / 2; const by = cy - r - 12;
  const fs = r * 0.75;
  return (
    <g>
      <rect x={bx} y={by} width={boxW} height={boxH} rx={5}
        fill={C.PLATE} stroke={active ? col + "77" : C.EDGE} strokeWidth={2} />
      {[[bx + 5, by + 5], [bx + boxW - 5, by + 5], [bx + 5, by + boxH - 5], [bx + boxW - 5, by + boxH - 5]].map(([px, py], i) =>
        <circle key={i} cx={px} cy={py} r={2.5} fill={active ? col : C.EDGE} opacity={.7} />)}
      <circle cx={cx} cy={cy} r={r + 4} fill={C.STEEL} stroke={active ? col + "88" : C.EDGE} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r} fill="#0A1420" stroke={active ? col : C.EDGE} strokeWidth={1.5} />
      <text x={cx} y={cy + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="700"
        fill={active ? col : C.DIM} fontFamily="'Courier New',monospace" letterSpacing="-.05em">M</text>
      {active && <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={col} strokeWidth={1} opacity={0}>
        <animate attributeName="opacity" values=".5;0;.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values={`${r + 4};${r + 11};${r + 4}`} dur="2s" repeatCount="indefinite" />
      </circle>}
      <text x={cx} y={by - 6} textAnchor="middle" fontSize={8} fontWeight="700"
        letterSpacing=".1em" fill={active ? col : C.TEXT} fontFamily="'Courier New',monospace">{label}</text>
      <ValBadge x={cx} y={by + boxH + 12} value={pct} unit="%" col={active ? C.WARN : C.DIM} small />
    </g>
  );
}

function ConnBox({ x, y, w, h, label, active, col }) {
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={4}
        fill={active ? C.PLATE : C.STEEL} stroke={active ? col : C.EDGE} strokeWidth={active ? 2 : 1} />
      {[[x, y - h / 2], [x + w, y - h / 2], [x, y + h / 2], [x + w, y + h / 2]].map(([cx2, cy2], i) =>
        <rect key={i} x={cx2 - 4} y={cy2 - 4} width={8} height={8} fill={active ? col : C.EDGE} rx={1} />)}
      <text x={x + w / 2} y={y + 4} textAnchor="middle" fontSize={9} fontWeight="700"
        letterSpacing=".1em" fill={active ? col : C.TEXT} fontFamily="'Courier New',monospace">{label}</text>
    </g>
  );
}

function SvgLabel({ x, y, text, col, small = false }) {
  return <text x={x} y={y} textAnchor="middle" fontSize={small ? 7.5 : 9}
    fontWeight="700" letterSpacing=".1em" fill={col} fontFamily="'Courier New',monospace">{text}</text>;
}

function WaterTank({ cx, cy, w = 160, h = 80, boilOn, chillOn, onHover }) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const waterLevel = 0.65; // 65% plin
  const waterH = (h - 10) * waterLevel;
  const waterY = y + h - 5 - waterH;

  // culoare apă în funcție de mod
  const waterCol = boilOn ? "#FF6B0044" : chillOn ? "#0099FF44" : "#1A3A4A44";
  const waterStroke = boilOn ? C.BOIL : chillOn ? C.CHILL : "#2A5A6A";

  return (
    <g>
      {/* umbra */}
      <rect x={x + 4} y={y + 4} width={w} height={h} rx={8} fill="#000000" opacity={0.3} />
      {/* corp rezervor */}
      <rect x={x} y={y} width={w} height={h} rx={8}
        fill={C.STEEL} stroke={boilOn || chillOn ? waterStroke : C.EDGE} strokeWidth={2} />
      {/* apă */}
      <clipPath id="tankClip">
        <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={6} />
      </clipPath>
      <rect x={x + 2} y={waterY} width={w - 4} height={waterH + 3} rx={4}
        fill={waterCol} clipPath="url(#tankClip)" />
      {/* valuri animate */}
      {(boilOn || chillOn) && (
        <g clipPath="url(#tankClip)" opacity={0.6}>
          <path d={`M${x + 2},${waterY + 6} Q${cx - 30},${waterY} ${cx},${waterY + 8} Q${cx + 30},${waterY + 16} ${x + w - 2},${waterY + 6}`}
            fill="none" stroke={waterStroke} strokeWidth={1.5} opacity={0.5}>
            <animate attributeName="d"
              values={`M${x + 2},${waterY + 6} Q${cx - 30},${waterY} ${cx},${waterY + 8} Q${cx + 30},${waterY + 16} ${x + w - 2},${waterY + 6};
                       M${x + 2},${waterY + 6} Q${cx - 30},${waterY + 12} ${cx},${waterY + 4} Q${cx + 30},${waterY} ${x + w - 2},${waterY + 6};
                       M${x + 2},${waterY + 6} Q${cx - 30},${waterY} ${cx},${waterY + 8} Q${cx + 30},${waterY + 16} ${x + w - 2},${waterY + 6}`}
              dur="3s" repeatCount="indefinite" />
          </path>
        </g>
      )}
      {/* linii orizontale decorative */}
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={i} x1={x + 12} y1={y + h * f} x2={x + w - 12} y2={y + h * f}
          stroke={C.EDGE} strokeWidth={1} opacity={0.4} />
      ))}
      {/* etichete niveluri */}
      <text x={x + w - 8} y={y + h * 0.25 + 4} textAnchor="end" fontSize={6}
        fill="#3A6A7A" fontFamily="'Courier New',monospace">75%</text>
      <text x={x + w - 8} y={y + h * 0.5 + 4} textAnchor="end" fontSize={6}
        fill="#3A6A7A" fontFamily="'Courier New',monospace">50%</text>
      <text x={x + w - 8} y={y + h * 0.75 + 4} textAnchor="end" fontSize={6}
        fill="#3A6A7A" fontFamily="'Courier New',monospace">25%</text>
      {/* conector stânga (boiler) */}
      <circle cx={x} cy={cy - 18} r={5} fill={boilOn ? C.BOIL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      <circle cx={x} cy={cy + 18} r={5} fill={boilOn ? C.BOIL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      {/* conector dreapta (chiller) */}
      <circle cx={x + w} cy={cy - 18} r={5} fill={chillOn ? C.CHILL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      <circle cx={x + w} cy={cy + 18} r={5} fill={chillOn ? C.CHILL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      {/* titlu */}
      <text x={cx} y={y - 12} textAnchor="middle" fontSize={9} fontWeight="700"
        letterSpacing=".14em" fill={boilOn || chillOn ? "#4ABACC" : C.TEXT}
        fontFamily="'Courier New',monospace">DEPOZIT UJI</text>
      {/* indicator status */}
      <g>
        <circle cx={x + 14} cy={y + 14} r={5}
          fill={boilOn || chillOn ? "#00FF88" : C.DIM}
          stroke={boilOn || chillOn ? "#00FF88" : C.EDGE} strokeWidth={1}>
          {(boilOn || chillOn) && <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />}
        </circle>
        <text x={x + 24} y={y + 18} fontSize={7} fill={boilOn || chillOn ? "#00FF88" : C.DIM}
          fontFamily="'Courier New',monospace">{boilOn || chillOn ? "ACTIV" : "STANDBY"}</text>
      </g>
      {/* buton hover */}
      <HoverZone x={x} y={y} w={w} h={h} tipKey="TANK"
        onHover={(k) => onHover(k, cx, y)} />
    </g>
  );
}

function Schematic({ d }) {
  const [tooltip, setTooltip] = useState({ key: null, x: 0, y: 0 });
  const onHover = useCallback((key, x, y) => { setTooltip({ key, x, y }); }, []);

  const on = d.status === "ON";
  const ventOn = on && d.Ventilator > 0;
  const aspOn = on && d.Aspirator > 0;
  const boilOn = on && d.Boil_Valve > 0;
  const chillOn = on && d.Chiller_Valve > 0;
  const anyOn = on;

  const VW = 860, VH = 500;
  const RET_Y = 78, SUP_Y = 202, DH = 60;
  const CX_X = 56, CX_W = 56;
  const CX_T = RET_Y - DH / 4, CX_B = SUP_Y + DH / 4;
  const CH_SUP = CX_X - 10, CH_RET = CX_X + 66;
  const HY_X = -14, HY_W = 35;
  const DIN_X = HY_X + HY_W + 7, DOUT_X = HY_X + HY_W + 7, DAMP_W = 23;
  const DUCT_START = CX_X + CX_W + 7;
  const FAN_X = DUCT_START + 8, FAN_W = 84;

  const BOIL_X = 282, BOIL_W = 78;
  const CHILL_X = 490, CHILL_W = 78;
  const F3_X = 582, F3_W = 20;
  const DP_X = 614;
  const CONN_X = 646, CONN_W = 56;
  const ROOM_X = 714, ROOM_W = 140;
  const ROOM_H = SUP_Y + DH / 2 - (RET_Y - DH / 2) + 8;
  const ROOM_Y = RET_Y - DH / 2 - 4;
  const LOOP_TOP = SUP_Y + DH / 2 + 6;

  const B_PL = BOIL_X + 14;
  const B_PR = BOIL_X + BOIL_W - 14;
  const B_PCX = (B_PL + B_PR) / 2;
  const B_PR_ = 4;
  const B_PCY = LOOP_TOP + 150;

  const C_PL = CHILL_X + 14;
  const C_PR = CHILL_X + CHILL_W - 14;
  const C_PCX = (C_PL + C_PR) / 2;
  const C_PR_ = -2;
  const C_PCY = LOOP_TOP + 150;

  const mid = (CX_T + CX_B) / 2;
  const py1 = RET_Y + DH / 2 + 5, py2 = SUP_Y - DH / 2 - 5, pmid = (py1 + py2) / 2;
  const dpCol = on ? C.WARN : "#2A4A4A";
  const boilDT = boilOn ? Math.round(d.Water_InpBoilTemp - d.Water_OutputBoilTemp) : 0;
  const chillDT = chillOn ? Math.round(d.Water_outChill_Temp - d.Water_InpChillTemp) : 0;

  const B_VCY = LOOP_TOP + (B_PCY - B_PR_ - 28 - LOOP_TOP) / 2;
  const C_VCY = LOOP_TOP + (C_PCY - C_PR_ - 28 - LOOP_TOP) / 2;
  const FR = 26;

  return (
    <svg viewBox={`-90 -10 ${VW + 90} ${VH}`} width="100%" height="100%"
      preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>

      <rect x={8} y={RET_Y - DH / 2 - 20} width={ROOM_X - 16}
        height={SUP_Y + DH / 2 - RET_Y + DH / 2 + 40} rx={6} fill={C.PLATE} stroke={C.EDGE} strokeWidth={1} />

      <rect x={CX_X - 4} y={CX_T - 4} width={CX_W + 8} height={CX_B - CX_T + 8}
        rx={6} fill={C.STEEL} stroke={anyOn ? "#2A6A5A" : C.EDGE} strokeWidth={2} />
      <rect x={CX_X} y={CX_T} width={CX_W} height={CX_B - CX_T}
        rx={4} fill="#0E1820" stroke={C.EDGE} strokeWidth={1} />
      {Array.from({ length: 6 }).map((_, i) => {
        const fy = CX_T + 10 + i * ((CX_B - CX_T - 20) / 5);
        return <line key={`g${i}`} x1={CX_X + 5} y1={fy} x2={CX_X + CX_W - 5} y2={fy}
          stroke="#1A3A4A" strokeWidth={1} opacity={.3} />;
      })}
      <line x1={CH_SUP} y1={CX_T + 5} x2={CH_RET} y2={CX_B - 5}
        stroke={aspOn ? C.SUP : "#1A3A4A"} strokeWidth={2} opacity={.7} />
      <line x1={CH_RET} y1={CX_T + 5} x2={CH_SUP} y2={CX_B - 5}
        stroke={ventOn ? C.RET : "#3A2A1A"} strokeWidth={2} opacity={.7} />
      {aspOn && [0, 1, 2].map(i => (
        <circle key={`hs${i}`} r={3} fill={C.SUP} opacity={0.95}>
          <animateMotion dur="1.6s" begin={`${-(i * 0.53).toFixed(2)}s`}
            repeatCount="indefinite"
            path={`M${CH_SUP},${CX_T + 5} L${CH_RET},${CX_B - 5}`} />
        </circle>
      ))}
      {ventOn && [0, 1, 2].map(i => (
        <circle key={`hr${i}`} r={3} fill={C.RET} opacity={0.95}>
          <animateMotion dur="1.6s" begin={`${-(i * 0.53).toFixed(2)}s`}
            repeatCount="indefinite"
            path={`M${CH_RET},${CX_T + 5} L${CH_SUP},${CX_B - 5}`} />
        </circle>
      ))}
      <text x={CX_X + CX_W / 2} y={CX_T - 9} textAnchor="middle" fontSize={9} fontWeight="700"
        letterSpacing=".12em" fill="#4A8A9A" fontFamily="'Courier New',monospace">HEX</text>
      <text x={CH_SUP} y={CX_T - 1} textAnchor="middle" fontSize={6}
        fill={aspOn ? C.SUP : "#2A5A6A"} fontFamily="'Courier New',monospace">SUP</text>
      <text x={CH_RET} y={CX_T - 1} textAnchor="middle" fontSize={6}
        fill={ventOn ? C.RET : "#5A3A1A"} fontFamily="'Courier New',monospace">RET</text>
      <HoverZone x={CX_X - 4} y={CX_T - 4} w={CX_W + 8} h={CX_B - CX_T + 8} tipKey="HEX"
        onHover={(_k, _x, _y) => onHover("HEX", CX_X + CX_W / 2, CX_T - 4)} />

      <Pipe x1={HY_X - 60} y1={RET_Y} x2={HY_X} y2={RET_Y} active={aspOn} col={airColor(d.Air_inp_Temp)} w={4} />
      <FlowLine x1={HY_X - 58} y1={RET_Y} x2={HY_X - 2} y2={RET_Y} active={aspOn} col={airColor(d.Air_inp_Temp)} />
      <rect x={HY_X - 72} y={RET_Y - 10} width={14} height={20} rx={3}
        fill={C.STEEL} stroke={aspOn ? airColor(d.Air_inp_Temp) : C.EDGE} strokeWidth={1.5} />
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={HY_X - 72 + 3} y1={RET_Y - 7 + i * 5} x2={HY_X - 72 + 11} y2={RET_Y - 7 + i * 5}
          stroke={aspOn ? airColor(d.Air_inp_Temp) : C.EDGE} strokeWidth={1} opacity={.8} />
      ))}
      <text x={HY_X - 65} y={RET_Y - 14} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={aspOn ? airColor(d.Air_inp_Temp) : C.DIM} fontFamily="'Courier New',monospace">Air</text>
      <text x={HY_X - 65} y={RET_Y - 22} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={aspOn ? airColor(d.Air_inp_Temp) : C.DIM} fontFamily="'Courier New',monospace">Fresh</text>
      <Pipe x1={HY_X} y1={SUP_Y} x2={HY_X - 60} y2={SUP_Y} active={ventOn} col={C.RET} w={4} />
      <FlowLine x1={HY_X - 2} y1={SUP_Y} x2={HY_X - 58} y2={SUP_Y} active={ventOn} col={C.RET} />
      <rect x={HY_X - 72} y={SUP_Y - 10} width={14} height={20} rx={3}
        fill={C.STEEL} stroke={ventOn ? C.RET : C.EDGE} strokeWidth={1.5} />
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={HY_X - 72 + 3} y1={SUP_Y - 7 + i * 5} x2={HY_X - 72 + 11} y2={SUP_Y - 7 + i * 5}
          stroke={ventOn ? C.RET : C.EDGE} strokeWidth={1} opacity={.8} />
      ))}
      <text x={HY_X - 65} y={SUP_Y + 22} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={ventOn ? C.RET : C.DIM} fontFamily="'Courier New',monospace">AER</text>
      <text x={HY_X - 65} y={SUP_Y + 30} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={ventOn ? C.RET : C.DIM} fontFamily="'Courier New',monospace">Exhaust</text>

      <rect x={HY_X} y={RET_Y - DH / 2} width={HY_W} height={DH - 7} rx={4}
        fill={aspOn ? C.PLATE : C.STEEL} stroke={aspOn ? airColor(d.Air_inp_Temp) : C.EDGE} strokeWidth={aspOn ? 1.5 : 1} />
      <text x={HY_X + HY_W / 2} y={RET_Y + 4} textAnchor="middle" fontSize={7} fontWeight="700"
        fill={aspOn ? airColor(d.Air_inp_Temp) : C.TEXT} fontFamily="'Courier New',monospace">Hyrja</text>
      <ValBadge x={HY_X + HY_W / 2} y={RET_Y - DH / 2 - 15} value={d.Air_inp_Temp} unit="°C" col={airColor(d.Air_inp_Temp)} small />
      <Dot x={HY_X + HY_W - 5} y={RET_Y - DH / 2 + 5} col={airColor(d.Air_inp_Temp)} active={aspOn} />
      <HoverZone x={HY_X} y={RET_Y - DH / 2} w={HY_W} h={DH - 7} tipKey="HYRJA"
        onHover={(k) => onHover(k, HY_X + HY_W / 2, RET_Y - DH / 2)} />
      <Pipe x1={HY_X + HY_W} y1={RET_Y} x2={DIN_X} y2={RET_Y} active={aspOn} col={C.SUP} w={3} />
      <FlowLine x1={HY_X + HY_W + 2} y1={RET_Y} x2={DIN_X - 2} y2={RET_Y} active={aspOn} col={C.SUP} />

      <Damper x={DIN_X} y={RET_Y} w={DAMP_W} h={DH - 10} pct={d.Inp_Damper} active={on} col={C.SUP} />
      <SvgLabel x={DIN_X + DAMP_W / 2} y={RET_Y - DH / 2 - 2} text="D-IN" col={on ? C.SUP : C.TEXT} small />
      <ValBadge x={DIN_X + DAMP_W / 2} y={RET_Y - DH / 2 - 23} value={d.Inp_Damper} unit="%" col={C.SUP} small />
      <HoverZone x={DIN_X} y={RET_Y - DH / 2} w={DAMP_W} h={DH - 10} tipKey="DAMPER_IN"
        onHover={(k) => onHover(k, DIN_X + DAMP_W / 2, RET_Y - DH / 2)} />

      <rect x={HY_X} y={SUP_Y - DH / 2 + 5} width={HY_W} height={DH - 7} rx={4}
        fill={ventOn ? C.PLATE : C.STEEL} stroke={ventOn ? C.RET : C.EDGE} strokeWidth={ventOn ? 1.5 : 1} />
      <text x={HY_X + HY_W / 2} y={SUP_Y + 5} textAnchor="middle" fontSize={7} fontWeight="700"
        fill={ventOn ? C.RET : C.TEXT} fontFamily="'Courier New',monospace">Dalja</text>
      <Dot x={HY_X + HY_W - 5} y={SUP_Y - DH / 2 + 11} col={C.RET} active={ventOn} />
      <HoverZone x={HY_X} y={SUP_Y - DH / 2 + 5} w={HY_W} h={DH - 7} tipKey="DALJA"
        onHover={(k) => onHover(k, HY_X + HY_W / 2, SUP_Y - DH / 2 + 5)} />
      <Pipe x1={HY_X + HY_W} y1={SUP_Y} x2={DOUT_X} y2={SUP_Y} active={ventOn} col={C.RET} w={3} />
      <FlowLine x1={DOUT_X - 2} y1={SUP_Y} x2={HY_X + HY_W + 2} y2={SUP_Y} active={ventOn} col={C.RET} />

      <Damper x={DOUT_X} y={SUP_Y} w={DAMP_W} h={DH - 10} pct={d.Output_Damper} active={on} col={C.RET} />
      <SvgLabel x={DOUT_X + DAMP_W / 2} y={SUP_Y + DH / 2 + 13} text="D-OUT" col={on ? C.RET : C.TEXT} small />
      <ValBadge x={DOUT_X + DAMP_W / 2} y={SUP_Y + DH / 2 + 27} value={d.Output_Damper} unit="%" col={C.RET} small />
      <HoverZone x={DOUT_X} y={SUP_Y - DH / 2} w={DAMP_W} h={DH - 10} tipKey="DAMPER_OUT"
        onHover={(k) => onHover(k, DOUT_X + DAMP_W / 2, SUP_Y - DH / 2)} />

      <rect x={DUCT_START - 3} y={RET_Y - DH / 2 - 3} width={CONN_X + CONN_W - DUCT_START + 6}
        height={DH + 6} rx={3} fill={C.PLATE} stroke={ventOn ? C.RET + "66" : C.EDGE} strokeWidth={2} />
      <rect x={DUCT_START} y={RET_Y - DH / 2 + 1} width={CONN_X + CONN_W - DUCT_START}
        height={DH - 2} rx={2} fill={C.STEEL} />
      <Pipe x1={DUCT_START} y1={RET_Y} x2={CONN_X + CONN_W} y2={RET_Y} active={ventOn} col={C.RET} w={2.5} dash="6 2" />
      <FlowLine x1={CONN_X - 3} y1={RET_Y} x2={FAN_X + FAN_W + 3} y2={RET_Y} active={ventOn} col={C.RET} />
      <FlowLine x1={FAN_X - 4} y1={RET_Y} x2={DUCT_START + 4} y2={RET_Y} active={ventOn} col={C.RET} />
      <rect x={DUCT_START - 3} y={SUP_Y - DH / 2 - 3} width={CONN_X + CONN_W - DUCT_START + 6}
        height={DH + 6} rx={3} fill={C.PLATE} stroke={aspOn ? C.SUP + "66" : C.EDGE} strokeWidth={2} />
      <rect x={DUCT_START} y={SUP_Y - DH / 2 + 1} width={CONN_X + CONN_W - DUCT_START}
        height={DH - 2} rx={2} fill={C.STEEL} />
      <Pipe x1={DUCT_START} y1={SUP_Y} x2={CONN_X + CONN_W} y2={SUP_Y} active={aspOn} col={C.SUP} w={2.5} dash="6 2" />
      <FlowLine x1={DUCT_START + 3} y1={SUP_Y} x2={FAN_X - 4} y2={SUP_Y} active={aspOn} col={C.SUP} />
      <FlowLine x1={FAN_X + FAN_W + 2} y1={SUP_Y} x2={BOIL_X - 3} y2={SUP_Y} active={aspOn} col={C.SUP} />
      <FlowLine x1={BOIL_X + BOIL_W + 2} y1={SUP_Y} x2={CHILL_X - 3} y2={SUP_Y}
        active={aspOn || boilOn} col={boilOn ? airColor(d.Water_OutputBoilTemp) : C.SUP} />
      <FlowLine x1={CHILL_X + CHILL_W + 2} y1={SUP_Y} x2={F3_X - 3} y2={SUP_Y}
        active={aspOn} col={airColor(d.Air_Output_Temp)} />
      <FlowLine x1={F3_X + F3_W + 2} y1={SUP_Y} x2={CONN_X - 3} y2={SUP_Y}
        active={aspOn} col={airColor(d.Air_Output_Temp)} />

      <Fan cx={FAN_X + FAN_W / 2} cy={RET_Y} r={FR} active={aspOn} col={C.RET} />
      <SvgLabel x={FAN_X + FAN_W / 2} y={RET_Y - DH / 2 - 11} text="ASPIRATOR" col={aspOn ? C.RET : C.TEXT} />
      <ValBadge x={FAN_X + FAN_W / 2} y={RET_Y - DH / 2 - 27} value={d.Aspirator} unit="%" col={C.RET} small />
      <Dot x={FAN_X + 7} y={RET_Y - DH / 2 + 5} col="#FF3333" active={aspOn} />
      <HoverZone x={FAN_X + FAN_W / 2 - FR - 6} y={RET_Y - FR - 6} w={(FR + 6) * 2} h={(FR + 6) * 2} tipKey="ASPIRATOR"
        onHover={(k) => onHover(k, FAN_X + FAN_W / 2, RET_Y - FR - 6)} />

      <Fan cx={FAN_X + FAN_W / 2} cy={SUP_Y} r={FR} active={ventOn} col={C.SUP} />
      <SvgLabel x={FAN_X + FAN_W / 2} y={SUP_Y + DH / 2 + 13} text="VENTILATOR" col={ventOn ? C.SUP : C.TEXT} />
      <ValBadge x={FAN_X + FAN_W / 2} y={SUP_Y + DH / 2 + 28} value={d.Ventilator} unit="%" col={C.SUP} small />
      <Dot x={FAN_X + 7} y={SUP_Y - DH / 2 + 5} col="#FF3333" active={ventOn} />
      <line x1={FAN_X + FAN_W / 2} y1={RET_Y + DH / 2} x2={FAN_X + FAN_W / 2} y2={SUP_Y - DH / 2}
        stroke="#2A5A6A" strokeWidth={1} strokeDasharray="4 4" opacity={.5} />
      <HoverZone x={FAN_X + FAN_W / 2 - FR - 6} y={SUP_Y - FR - 6} w={(FR + 6) * 2} h={(FR + 6) * 2} tipKey="VENTILATOR"
        onHover={(k) => onHover(k, FAN_X + FAN_W / 2, SUP_Y - FR - 6)} />

      <Coil x={BOIL_X} y={SUP_Y} w={BOIL_W} h={DH - 9} active={boilOn} col={C.BOIL} />
      <SvgLabel x={BOIL_X + BOIL_W / 2} y={SUP_Y + DH / 2 + 13} text="BOILER" col={boilOn ? C.BOIL : C.TEXT} />
      <Dot x={BOIL_X + 7} y={SUP_Y - DH / 2 + 5} col={C.BOIL} active={boilOn} />
      {boilOn && <>
        <line x1={BOIL_X + BOIL_W / 2} y1={RET_Y + DH / 2} x2={BOIL_X + BOIL_W / 2}
          y2={(RET_Y + SUP_Y) / 2 + 7} stroke={C.BOIL} strokeWidth={1} strokeDasharray="3 3" opacity={.6} />
        <text x={BOIL_X + BOIL_W / 2} y={(RET_Y + SUP_Y) / 2 + 18} textAnchor="middle"
          fontSize={9} fontWeight="700" fill={C.BOIL} fontFamily="'Courier New',monospace">+{boilDT}°C</text>
      </>}
      <HoverZone x={BOIL_X} y={SUP_Y - DH / 2} w={BOIL_W} h={DH - 9} tipKey="BOILER_COIL"
        onHover={(k) => onHover(k, BOIL_X + BOIL_W / 2, SUP_Y - DH / 2)} />

      <Coil x={CHILL_X} y={SUP_Y} w={CHILL_W} h={DH - 9} active={chillOn} col={C.CHILL} />
      <SvgLabel x={CHILL_X + CHILL_W / 2} y={SUP_Y + DH / 2 + 13} text="CHILLER" col={chillOn ? C.CHILL : C.TEXT} />
      <Dot x={CHILL_X + 7} y={SUP_Y - DH / 2 + 5} col={C.CHILL} active={chillOn} />
      {chillOn && <>
        <line x1={CHILL_X + CHILL_W / 2} y1={RET_Y + DH / 2} x2={CHILL_X + CHILL_W / 2}
          y2={(RET_Y + SUP_Y) / 2 + 7} stroke={C.CHILL} strokeWidth={1} strokeDasharray="3 3" opacity={.6} />
        <text x={CHILL_X + CHILL_W / 2} y={(RET_Y + SUP_Y) / 2 + 18} textAnchor="middle"
          fontSize={9} fontWeight="700" fill={C.CHILL} fontFamily="'Courier New',monospace">-{chillDT}°C</text>
      </>}
      <HoverZone x={CHILL_X} y={SUP_Y - DH / 2} w={CHILL_W} h={DH - 9} tipKey="CHILLER_COIL"
        onHover={(k) => onHover(k, CHILL_X + CHILL_W / 2, SUP_Y - DH / 2)} />

      <Filter x={F3_X} y={SUP_Y} w={F3_W} h={DH - 9} active={aspOn} col={C.SUP} />
      <SvgLabel x={F3_X + F3_W / 2} y={SUP_Y + DH / 2 + 13} text="F3" col={aspOn ? C.SUP : C.TEXT} small />
      <HoverZone x={F3_X} y={SUP_Y - DH / 2} w={F3_W} h={DH - 9} tipKey="FILTER_F3"
        onHover={(k) => onHover(k, F3_X + F3_W / 2, SUP_Y - DH / 2)} />

      <line x1={DP_X} y1={py1} x2={DP_X} y2={py2} stroke={dpCol} strokeWidth={2} strokeDasharray="5 3" />
      <polygon points={`${DP_X},${py2} ${DP_X - 5},${py2 + 10} ${DP_X + 5},${py2 + 10}`} fill={dpCol} />
      <polygon points={`${DP_X},${py1} ${DP_X - 5},${py1 - 10} ${DP_X + 5},${py1 - 10}`} fill={dpCol} />
      <rect x={DP_X - 22} y={pmid - 14} width={44} height={28} rx={4} fill={C.STEEL} stroke={dpCol} strokeWidth={1.5} />
      <text x={DP_X} y={pmid - 1} textAnchor="middle" fontSize={10} fontWeight="700"
        fill={dpCol} fontFamily="'Courier New',monospace">ΔP</text>
      <text x={DP_X} y={pmid + 11} textAnchor="middle" fontSize={8}
        fill={dpCol} fontFamily="'Courier New',monospace">{on ? `${d.Out_Return_Pressure}b` : "—"}</text>
      <HoverZone x={DP_X - 22} y={pmid - 14} w={44} h={28} tipKey="DP"
        onHover={(k) => onHover(k, DP_X, pmid - 14)} />

      <ConnBox x={CONN_X} y={RET_Y} w={CONN_W} h={DH - 10} label="Kthimi" active={ventOn} col={C.RET} />
      <Dot x={CONN_X + 7} y={RET_Y - DH / 2 + 7} col={C.RET} active={ventOn} />
      <ValBadge x={CONN_X + CONN_W / 2} y={RET_Y - DH / 2 - 13} value={d.Air_Return_Temp} unit="°C"
        col={airColor(d.Air_Return_Temp)} small />
      <HoverZone x={CONN_X} y={RET_Y - DH / 2} w={CONN_W} h={DH - 10} tipKey="KTHIMI"
        onHover={(k) => onHover(k, CONN_X + CONN_W / 2, RET_Y - DH / 2)} />
      <ConnBox x={CONN_X} y={SUP_Y} w={CONN_W} h={DH - 10} label="Dërgimi" active={aspOn} col={C.SUP} />
      <Dot x={CONN_X + 7} y={SUP_Y - DH / 2 + 7} col={C.SUP} active={aspOn} />
      <ValBadge x={CONN_X + CONN_W / 2} y={SUP_Y + DH / 2 + 13} value={d.Air_Output_Temp} unit="°C"
        col={airColor(d.Air_Output_Temp)} small />
      <g>
        <rect x={CONN_X} y={SUP_Y + DH / 2 + 29} width={CONN_W} height={17} rx={3}
          fill={C.STEEL} stroke="#88BBFF" strokeWidth={1} />
        <text x={CONN_X + CONN_W / 2} y={SUP_Y + DH / 2 + 41} textAnchor="middle"
          fontSize={8} fontWeight="700" fill="#88BBFF"
          fontFamily="'Courier New',monospace">RH {d.Air_outHygro}%</text>
      </g>
      <HoverZone x={CONN_X} y={SUP_Y - DH / 2} w={CONN_W} h={DH - 10} tipKey="DERGIMI"
        onHover={(k) => onHover(k, CONN_X + CONN_W / 2, SUP_Y - DH / 2)} />

      <Pipe x1={CONN_X + CONN_W} y1={RET_Y} x2={ROOM_X} y2={RET_Y} active={ventOn} col={C.RET} />
      <Pipe x1={CONN_X + CONN_W} y1={SUP_Y} x2={ROOM_X} y2={SUP_Y} active={aspOn} col={C.SUP} />
      <FlowLine x1={ROOM_X - 2} y1={RET_Y} x2={CONN_X + CONN_W + 2} y2={RET_Y} active={ventOn} col={C.RET} />
      <FlowLine x1={CONN_X + CONN_W + 2} y1={SUP_Y} x2={ROOM_X - 2} y2={SUP_Y} active={aspOn} col={C.SUP} />
      <rect x={ROOM_X} y={ROOM_Y} width={ROOM_W} height={ROOM_H} rx={6}
        fill={anyOn ? "#111E28" : "#0C1520"} stroke={anyOn ? "#2A6A5A" : C.EDGE} strokeWidth={2} />
      <text x={ROOM_X + ROOM_W / 2} y={ROOM_Y + ROOM_H / 2 - 7} textAnchor="middle" fontSize={10}
        fontWeight="700" letterSpacing=".14em" fill={anyOn ? C.HEAD : C.TEXT} fontFamily="'Courier New',monospace">Degenza 1</text>
      <text x={ROOM_X + ROOM_W / 2} y={ROOM_Y + ROOM_H / 2 + 9} textAnchor="middle" fontSize={9}
        fontWeight="700" fill={airColor(d.Air_Output_Temp)} fontFamily="'Courier New',monospace">
        {d.Air_Output_Temp}°C
      </text>
      <HoverZone x={ROOM_X} y={ROOM_Y} w={ROOM_W} h={ROOM_H} tipKey="ROOM"
        onHover={(k) => onHover(k, ROOM_X + ROOM_W / 2, ROOM_Y)} />

      <Pipe x1={B_PL} y1={LOOP_TOP} x2={B_PL} y2={B_PCY - B_PR_ - 20} active={boilOn} col={C.BOIL} w={5} />
      <FlowLine x1={B_PL} y1={B_PCY - B_PR_ - 22} x2={B_PL} y2={LOOP_TOP + 6} active={boilOn} col={C.BOIL} />
      <circle cx={B_PL} cy={LOOP_TOP} r={6} fill={boilOn ? C.BOIL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      <WaterValve cx={B_PL} cy={B_VCY} r={11} pct={d.Boil_Valve} active={boilOn} col={C.BOIL} />
      <rect x={B_PL + 15} y={B_VCY - 9} width={56} height={18} rx={3}
        fill={C.STEEL} stroke={boilOn ? C.BOIL + "88" : C.EDGE} strokeWidth={1} />
      <text x={B_PL + 43} y={B_VCY + 4} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={boilOn ? C.BOIL : C.DIM} fontFamily="'Courier New',monospace">Valve</text>
      <HoverZone x={B_PL - 14} y={B_VCY - 14} w={70} h={28} tipKey="BOILER_VALVE"
        onHover={(k) => onHover(k, B_PL + 20, B_VCY - 14)} />
      <Pipe x1={B_PR} y1={LOOP_TOP} x2={B_PR} y2={B_PCY - B_PR_ - 20} active={boilOn} col={C.BOIL} w={5} />
      <FlowLine x1={B_PR} y1={LOOP_TOP + 6} x2={B_PR} y2={B_PCY - B_PR_ - 22} active={boilOn} col={C.BOIL} />
      <circle cx={B_PR} cy={LOOP_TOP} r={6} fill={boilOn ? C.BOIL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      <ValBadge x={B_PL - 30} y={LOOP_TOP + 28} value={d.Water_InpBoilTemp} unit="°C" col={boilOn ? C.BOIL : "#2A1A08"} />
      <ValBadge x={B_PR + 30} y={LOOP_TOP + 28} value={d.Water_OutputBoilTemp} unit="°C" col={boilOn ? C.BOIL : "#2A1A08"} />
      <text x={B_PL - 30} y={LOOP_TOP + 11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={boilOn ? C.BOIL : "#2A1A08"} fontFamily="'Courier New',monospace">W.IN</text>
      <text x={B_PR + 30} y={LOOP_TOP + 11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={boilOn ? C.BOIL : "#2A1A08"} fontFamily="'Courier New',monospace">W.OUT</text>
      <PumpDevice cx={B_PCX} cy={B_PCY} active={boilOn} col={C.BOIL}
        pct={d.Boil_Pump_Invert} label="PUMP" />
      <HoverZone x={B_PCX - 29} y={B_PCY - B_PR_ - 16}
        w={58} h={B_PR_ * 2 + 36} tipKey="BOILER_PUMP"
        onHover={(k) => onHover(k, B_PCX, B_PCY - B_PR_ - 16)} />

        

      <Pipe x1={C_PL} y1={LOOP_TOP} x2={C_PL} y2={C_PCY - C_PR_ - 20} active={chillOn} col={C.CHILL} w={5} />
      <FlowLine x1={C_PL} y1={C_PCY - C_PR_ - 22} x2={C_PL} y2={LOOP_TOP + 6} active={chillOn} col={C.CHILL} />
      <circle cx={C_PL} cy={LOOP_TOP} r={6} fill={chillOn ? C.CHILL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      <WaterValve cx={C_PL} cy={C_VCY} r={11} pct={d.Chiller_Valve} active={chillOn} col={C.CHILL} />
      <rect x={C_PL + 15} y={C_VCY - 9} width={70} height={18} rx={3}
        fill={C.STEEL} stroke={chillOn ? C.CHILL + "88" : C.EDGE} strokeWidth={1} />
      <text x={C_PL + 50} y={C_VCY + 4} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={chillOn ? C.CHILL : C.DIM} fontFamily="'Courier New',monospace">Valve</text>
      <HoverZone x={C_PL - 14} y={C_VCY - 14} w={80} h={28} tipKey="CHILLER_VALVE"
        onHover={(k) => onHover(k, C_PL + 25, C_VCY - 14)} />
      <Pipe x1={C_PR} y1={LOOP_TOP} x2={C_PR} y2={C_PCY - C_PR_ - 20} active={chillOn} col={C.CHILL} w={5} />
      <FlowLine x1={C_PR} y1={LOOP_TOP + 6} x2={C_PR} y2={C_PCY - C_PR_ - 22} active={chillOn} col={C.CHILL} />
      <circle cx={C_PR} cy={LOOP_TOP} r={6} fill={chillOn ? C.CHILL : C.EDGE} stroke={C.STEEL} strokeWidth={1.5} />
      <ValBadge x={C_PL - 30} y={LOOP_TOP + 28} value={d.Water_InpChillTemp} unit="°C" col={chillOn ? C.CHILL : "#081828"} />
      <ValBadge x={C_PR + 30} y={LOOP_TOP + 28} value={d.Water_outChill_Temp} unit="°C" col={chillOn ? C.CHILL : "#081828"} />
      <text x={C_PL - 30} y={LOOP_TOP + 11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={chillOn ? C.CHILL : "#081828"} fontFamily="'Courier New',monospace">W.IN</text>
      <text x={C_PR + 30} y={LOOP_TOP + 11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={chillOn ? C.CHILL : "#081828"} fontFamily="'Courier New',monospace">W.OUT</text>
      <PumpDevice cx={C_PCX} cy={C_PCY} active={chillOn} col={C.CHILL}
        pct={d.Chiller_Pump_invert} label="PUMP" />
      <HoverZone x={C_PCX - 29} y={C_PCY - C_PR_ - 16}
        w={58} h={C_PR_ * 2 + 36} tipKey="CHILLER_PUMP"
        onHover={(k) => onHover(k, C_PCX, C_PCY - C_PR_ - 16)} />

      <SvgTooltip x={tooltip.x} y={tooltip.y} tipKey={tooltip.key} vw={VW + 90} />
    </svg>
    
  );
  
}

function SensorTable({ d }) {
  const on = d.status === "ON", boilOn = on && d.Boil_Valve > 0, chillOn = on && d.Chiller_Valve > 0;
  const groups = [
    {
      label: "AIR TEMPS", col: airColor(d.Air_Output_Temp), active: on, rows: [
        { k: "Air_inp_Temp", v: `${d.Air_inp_Temp}°C` },
        { k: "Air_Output_Temp", v: `${d.Air_Output_Temp}°C` },
        { k: "Air_Return_Temp", v: `${d.Air_Return_Temp}°C` },
        { k: "Air_outHygro", v: `${d.Air_outHygro}%` },
      ]
    },
    {
      label: "WATER TEMPS", col: boilOn ? C.BOIL : chillOn ? C.CHILL : C.TEXT, active: boilOn || chillOn, rows: [
        { k: "Water_InpBoilTemp", v: `${d.Water_InpBoilTemp}°C` },
        { k: "Water_OutputBoilTemp", v: `${d.Water_OutputBoilTemp}°C` },
        { k: "Water_InpChillTemp", v: `${d.Water_InpChillTemp}°C` },
        { k: "Water_outChill_Temp", v: `${d.Water_outChill_Temp}°C` },
      ]
    },
    {
      label: "ACTUATORS", col: C.WARN, active: on, rows: [
        { k: "Boil_Valve", v: `${d.Boil_Valve}%` },
        { k: "Chiller_Valve", v: `${d.Chiller_Valve}%` },
        { k: "Inp_Damper", v: `${d.Inp_Damper}%` },
        { k: "Output_Damper", v: `${d.Output_Damper}%` },
      ]
    },
    {
      label: "DRIVES & STATUS", col: C.OK, active: on, rows: [
        { k: "Ventilator", v: `${d.Ventilator}%` },
        { k: "Aspirator", v: `${d.Aspirator}%` },
        { k: "Boil_Pump_Invert", v: `${d.Boil_Pump_Invert}%` },
        { k: "Chiller_Pump_invert", v: `${d.Chiller_Pump_invert}%` },
        { k: "Out_Return_Pressure", v: `${d.Out_Return_Pressure} bar` },
        { k: "Power_Status", v: d.Power_Status },
        { k: "Sezon_Modality", v: d.Sezon_Modality },
      ]
    },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4,1fr)",
      borderTop: `2px solid ${C.EDGE}`, background: "#0C1520", flexShrink: 0
    }}>
      {groups.map(({ label, col, active, rows }, idx) => (
        <div key={label} style={{ padding: "7px 12px", borderLeft: idx > 0 ? `1px solid ${C.EDGE}` : "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            marginBottom: 5, paddingBottom: 4, borderBottom: `1px solid ${C.EDGE}`
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: active ? col : C.EDGE, boxShadow: active ? `0 0 5px ${col}` : "none"
            }} />
            <span style={{ fontSize: 7, color: active ? col : C.TEXT, fontWeight: 700, letterSpacing: ".12em" }}>{label}</span>
            <span style={{ marginLeft: "auto", fontSize: 6, color: active ? C.OK : "#2A4A3A", letterSpacing: ".1em" }}>
              {active ? "● ACT" : "○ STB"}
            </span>
          </div>
          {rows.map(({ k, v }) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "baseline", marginBottom: 3
            }}>
              <span style={{ fontSize: 6, color: "#3A6A7A", letterSpacing: ".04em" }}>{k}</span>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: active ? col : C.TEXT, letterSpacing: ".04em" }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ✅ MODIFICAREA PRINCIPALĂ — folosim useUta() din context în loc de fetch
export default function AppUta() {
  const { utas, loading } = useUta(); // ← date din context, refresh automat la 5s
  const [selId, setSelId] = useState(null);

  // Mapăm Chiller_Pump_invert o singură dată
  const units = utas.map(u => ({
    ...u,
    Chiller_Pump_invert: u.Chiller_Pump_invert ?? u.Chiller_Pump_Invert ?? 0,
  }));

  // Setează primul ID când datele sosesc prima dată
  if (!selId && units.length > 0) {
    setSelId(units[0].id);
  }

  if (loading) return (
    <div style={{
      color: "#00FF88", background: "#0E1820", height: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New',monospace", fontSize: 14
    }}>
      Se încarcă datele...
    </div>
  );

  if (!units.length) return (
    <div style={{
      color: "#FF5533", background: "#0E1820", height: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New',monospace", fontSize: 14
    }}>
      Nu s-au găsit date UTA.
    </div>
  );

  const d = units.find(u => u.id === selId) ?? units[0];
  const on = d.status === "ON", boilOn = on && d.Boil_Valve > 0, chillOn = on && d.Chiller_Valve > 0;
  const anyOn = on, allOn = on && (boilOn || chillOn);
  const statusText = allOn ? "ALL SYSTEMS ACTIVE" : anyOn ? "PARTIAL OPERATION" : "STANDBY";
  const statusColor = allOn ? C.OK : anyOn ? C.WARN : "#3A5A5A";
  const seasonColor = d.Sezon_Modality === "HEATING" ? C.BOIL : d.Sezon_Modality === "COOLING" ? C.CHILL : "#4A8A7A";

  return (
    <div style={{
      fontFamily: "'Courier New',monospace",
      background: "linear-gradient(160deg,#0E1820 0%,#121E28 100%)",
      border: `1px solid ${C.EDGE}`, overflow: "hidden", width: "100%",
      display: "flex", flexDirection: "column", height: "100vh"
    }}>
      <style>{`
        @keyframes ahuFlow  { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
        @keyframes ahuBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .ahu-blink { animation:ahuBlink 1s infinite; }
      `}</style>

      <div style={{
        display: "flex", alignItems: "stretch",
        borderBottom: `2px solid ${C.EDGE}`, background: "#0C1520", flexShrink: 0
      }}>
        <div style={{ padding: "6px 16px", borderRight: `1px solid ${C.EDGE}`, minWidth: 180 }}>
          <div style={{ fontSize: 6.5, color: "#4A7A8A", letterSpacing: ".2em", marginBottom: 2 }}>BUILDING MANAGEMENT SYSTEM</div>
          <div style={{ fontSize: 14, color: C.HEAD, fontWeight: 700, letterSpacing: ".12em" }}>{d.id}</div>
          <div style={{ fontSize: 7, color: "#4A7A8A", letterSpacing: ".1em", marginTop: 1 }}>AIR HANDLING UNIT</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 16px", gap: 20 }}>
          <select value={selId ?? ""} onChange={e => setSelId(e.target.value)}
            style={{
              background: "#0C1520", color: C.OK, border: `1px solid #1E4A3A`,
              borderRadius: 3, padding: "3px 8px", fontSize: 8, fontFamily: "inherit",
              cursor: "pointer", outline: "none", letterSpacing: ".08em"
            }}>
            {units.map(u => (
              <option key={u.id} value={u.id} style={{ background: "#0C1520", color: u.status === "ON" ? C.OK : "#3A5A3A" }}>
                {u.id}  ◆  {u.status}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 12 }}>
            {["PLC", "VFD", "BMS"].map(l => (
              <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: anyOn ? C.OK : "#1A3A2A", boxShadow: anyOn ? `0 0 6px ${C.OK}` : "none"
                }} />
                <span style={{ fontSize: 6.5, color: anyOn ? C.OK : "#2A4A3A", letterSpacing: ".1em" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {[
            { l: "SUPPLY", v: `${d.Air_Output_Temp}°C`, col: airColor(d.Air_Output_Temp) },
            { l: "RETURN", v: `${d.Air_Return_Temp}°C`, col: airColor(d.Air_Return_Temp) },
            { l: "ΔP", v: `${d.Out_Return_Pressure} bar`, col: C.WARN },
            { l: "HYGRO", v: `${d.Air_outHygro}%`, col: "#88BBFF" },
          ].map(({ l, v, col }) => (
            <div key={l} style={{
              padding: "4px 12px", borderLeft: `1px solid ${C.EDGE}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2
            }}>
              <div style={{ fontSize: 6, color: "#4A7A8A", letterSpacing: ".15em" }}>{l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: col, letterSpacing: ".05em" }}>{v}</div>
            </div>
          ))}
          <div style={{
            padding: "4px 16px", borderLeft: `2px solid ${C.EDGE}`,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 3, minWidth: 140
          }}>
            <div style={{ fontSize: 6.5, color: "#4A7A8A", letterSpacing: ".15em" }}>SYSTEM STATUS</div>
            <div style={{
              fontSize: 8, color: statusColor, fontWeight: 700, letterSpacing: ".12em",
              padding: "2px 10px", border: `1px solid ${statusColor}`, borderRadius: 2
            }}>
              {statusText}
              {anyOn && <span className="ahu-blink" style={{ marginLeft: 5 }}>◆</span>}
            </div>
            <div style={{ fontSize: 6.5, color: seasonColor, letterSpacing: ".1em" }}>{d.Sezon_Modality}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#0E1820", position: "relative", flex: 1, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.1) 2px,rgba(0,0,0,.1) 4px)"
        }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
          <Schematic d={d} />
        </div>
      </div>

      <SensorTable d={d} />
    </div>
  );
}