import { useState } from "react";

import { initialUtaData } from "../content/uta/uta data/utaData";

// Normalizează câmpurile — rezolvă inconsistențe de majuscule între intrări
const UNITS = initialUtaData.map(u => ({
  ...u,
  // unifica Chiller_Pump_Invert / Chiller_Pump_invert → întotdeauna cu i mic
  Chiller_Pump_invert: u.Chiller_Pump_invert ?? u.Chiller_Pump_Invert ?? 0,
}));

function airColor(t) {
  if (t <= 0)  return "#88EEFF";
  if (t <= 10) return "#00CCFF";
  if (t <= 20) return "#00E5CC";
  if (t <= 28) return "#FFAA00";
  return "#FF5533";
}

const C = {
  SUP:"#00E5FF", RET:"#FF8C00", BOIL:"#FF6B00", CHILL:"#0099FF",
  EDGE:"#2E4050", TEXT:"#8AABB8", HEAD:"#C8E8F0",
  PLATE:"#232F38", STEEL:"#1C2830", DIM:"#2A3A3A",
  OK:"#00FF88", WARN:"#FFD700",
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function ValBadge({ x, y, value, unit, col, small = false }) {
  const fs = small ? 8 : 10;
  const str = `${value} ${unit}`;
  const bw = str.length * (small ? 5.4 : 6.2) + 14;
  return (
    <g>
      <rect x={x-bw/2} y={y-12} width={bw} height={22} rx={3} fill={C.STEEL} stroke={col} strokeWidth={1}/>
      <text x={x} y={y+6} textAnchor="middle" fontSize={fs} fontWeight="700" fill={col}
        letterSpacing=".03em" fontFamily="'Courier New',monospace">{str}</text>
    </g>
  );
}

function Dot({ x, y, col, active }) {
  return active ? (
    <g>
      <circle cx={x} cy={y} r={5} fill={col+"33"} stroke={col} strokeWidth={1.5}>
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx={x} cy={y} r={3} fill={col}/>
    </g>
  ) : (
    <g>
      <circle cx={x} cy={y} r={5} fill="none" stroke="#3A4A4A" strokeWidth={1.5}/>
      <circle cx={x} cy={y} r={3} fill={C.DIM}/>
    </g>
  );
}

function Pipe({ x1, y1, x2, y2, active, col, w=3, dash="" }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={active ? col : C.DIM} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round"/>;
}

function FlowLine({ x1, y1, x2, y2, active, col }) {
  if (!active) return null;
  const dur = (Math.hypot(x2-x1, y2-y1) / 80).toFixed(1);
  const path = `M${x1},${y1} L${x2},${y2}`;
  return (
    <>
      {[0, 1, 2].map(i => (
        <circle key={i} r={4} fill={col} opacity={0.9}>
          <animateMotion
            dur={`${dur}s`}
            begin={`${-(i * parseFloat(dur) / 3).toFixed(2)}s`}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      ))}
    </>
  );
}

// Arrow on a pipe: draws a filled arrowhead pointing in the direction x1→x2 / y1→y2
function PipeArrow({ x, y, dir, col, active }) {
  // dir: "right" | "left" | "down" | "up"
  const s = 7;
  const fill = active ? col : C.DIM;
  const pts = {
    right: `${x},${y-s} ${x+s*1.6},${y} ${x},${y+s}`,
    left:  `${x},${y-s} ${x-s*1.6},${y} ${x},${y+s}`,
    down:  `${x-s},${y} ${x},${y+s*1.6} ${x+s},${y}`,
    up:    `${x-s},${y} ${x},${y-s*1.6} ${x+s},${y}`,
  };
  return <polygon points={pts[dir]} fill={fill} opacity={active ? 1 : 0.4}/>;
}

function Fan({ cx, cy, r=28, active, col }) {
  const blades = Array.from({length:6}).map((_,i) => {
    const a=(i*60)*Math.PI/180, a2=(i*60+35)*Math.PI/180;
    const ix=cx+6*Math.cos(a), iy=cy+6*Math.sin(a);
    const ox=cx+(r-3)*Math.cos(a), oy=cy+(r-3)*Math.sin(a);
    const mx=cx+(r-8)*Math.cos(a2), my=cy+(r-8)*Math.sin(a2);
    return `M${ix.toFixed(1)},${iy.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ox.toFixed(1)},${oy.toFixed(1)}`;
  }).join(" ");
  return (
    <g>
      <circle cx={cx} cy={cy} r={r+6} fill={C.PLATE} stroke={active?col+"88":C.EDGE} strokeWidth={2}/>
      <circle cx={cx} cy={cy} r={r+2} fill={C.STEEL}/>
      <g stroke={active?col:C.DIM} strokeWidth={2.5} fill="none">
        <path d={blades}>
          {active && <animateTransform attributeName="transform" type="rotate"
            values={`0 ${cx} ${cy};360 ${cx} ${cy}`} dur="1.4s" repeatCount="indefinite"/>}
        </path>
      </g>
      <circle cx={cx} cy={cy} r={7} fill={C.PLATE} stroke={active?col:C.EDGE} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={3} fill={active?col:C.DIM}/>
      {active && <circle cx={cx} cy={cy} r={r+8} fill="none" stroke={col} strokeWidth={1} opacity={0}>
        <animate attributeName="opacity" values=".4;0;.4" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="r" values={`${r+6};${r+14};${r+6}`} dur="2s" repeatCount="indefinite"/>
      </circle>}
    </g>
  );
}

function Coil({ x, y, w, h, active, col }) {
  const lines = [];
  for (let i=8; i<w-7; i+=9)
    lines.push(<line key={i} x1={x+i} y1={y-h/2+5} x2={x+i} y2={y+h/2-5}
      stroke={active?col:C.DIM} strokeWidth={2.5}/>);
  return (
    <g>
      <rect x={x} y={y-h/2} width={w} height={h} rx={3}
        fill={C.PLATE} stroke={active?col+"88":C.EDGE} strokeWidth={1.5}/>
      {lines}
      <line x1={x+5} y1={y-h/2+5} x2={x+w-5} y2={y-h/2+5} stroke={active?col:C.DIM} strokeWidth={1} opacity={.5}/>
      <line x1={x+5} y1={y+h/2-5} x2={x+w-5} y2={y+h/2-5} stroke={active?col:C.DIM} strokeWidth={1} opacity={.5}/>
    </g>
  );
}

function Filter({ x, y, w, h, active, col }) {
  const lines = [];
  for (let i=6; i<h-4; i+=7)
    lines.push(<line key={i} x1={x+4} y1={y-h/2+i} x2={x+w-4} y2={y-h/2+i}
      stroke={active?col:C.DIM} strokeWidth={1.5} opacity={.8}/>);
  return (
    <g>
      <rect x={x} y={y-h/2} width={w} height={h} rx={3}
        fill={C.PLATE} stroke={active?col:C.EDGE} strokeWidth={1.5}/>
      {lines}
    </g>
  );
}

function Damper({ x, y, w, h, pct, active, col }) {
  const bladeH = (h-8)*(pct/100);
  return (
    <g>
      <rect x={x} y={y-h/2} width={w} height={h} rx={3}
        fill={C.STEEL} stroke={active?col:C.EDGE} strokeWidth={1.5}/>
      <rect x={x+3} y={y-h/2+4} width={w-6} height={bladeH} rx={2}
        fill={active?col+"44":C.DIM}/>
      <line x1={x} y1={y} x2={x+w} y2={y}
        stroke={active?col:C.DIM} strokeWidth={1} opacity={.5} strokeDasharray="3 2"/>
    </g>
  );
}

function WaterValve({ cx, cy, r=10, pct, active, col }) {
  const openAngle = (pct/100)*80;
  const rad = a => (a-90)*Math.PI/180;
  const arcR = r-3;
  const ax1 = cx + arcR*Math.cos(rad(-openAngle/2));
  const ay1 = cy + arcR*Math.sin(rad(-openAngle/2));
  const ax2 = cx + arcR*Math.cos(rad( openAngle/2));
  const ay2 = cy + arcR*Math.sin(rad( openAngle/2));
  const stemH = r+8;
  return (
    <g>
      <polygon points={`${cx-r},${cy-r} ${cx},${cy} ${cx-r},${cy+r}`}
        fill={active?col+"33":C.DIM} stroke={active?col:C.EDGE} strokeWidth={1.5} strokeLinejoin="round"/>
      <polygon points={`${cx+r},${cy-r} ${cx},${cy} ${cx+r},${cy+r}`}
        fill={active?col+"33":C.DIM} stroke={active?col:C.EDGE} strokeWidth={1.5} strokeLinejoin="round"/>
      {pct>0 && <path
        d={`M${cx},${cy} L${ax1.toFixed(1)},${ay1.toFixed(1)} A${arcR},${arcR} 0 ${openAngle>180?1:0},1 ${ax2.toFixed(1)},${ay2.toFixed(1)} Z`}
        fill={active?col+"55":C.DIM} stroke="none"/>}
      <circle cx={cx} cy={cy} r={2.5} fill={active?col:C.EDGE}/>
      <line x1={cx} y1={cy-r} x2={cx} y2={cy-r-stemH} stroke={active?col:C.EDGE} strokeWidth={2} strokeLinecap="round"/>
      <circle cx={cx} cy={cy-r-stemH} r={5} fill={C.STEEL} stroke={active?col:C.EDGE} strokeWidth={1.5}/>
      <line x1={cx-5} y1={cy-r-stemH} x2={cx+5} y2={cy-r-stemH} stroke={active?col:C.EDGE} strokeWidth={1.5}/>
      <line x1={cx} y1={cy-r-stemH-5} x2={cx} y2={cy-r-stemH+5} stroke={active?col:C.EDGE} strokeWidth={1.5}/>
      <ValBadge x={cx} y={cy+r+18} value={pct} unit="%" col={active?col:C.DIM} small/>
    </g>
  );
}

// Pump with M motor symbol
function PumpDevice({ cx, cy, r=22, active, col, pct, label }) {
  const boxW = r*2+64; const boxH = r*2+52;
  const bx = cx-boxW/2; const by = cy-r-22;
  const fs = r*1.05;
  const wy = cy+r*0.52; const wx = cx-r*0.32;
  const amp=3, step=r*0.17;
  const wavePath = `M${wx},${wy} q${step},${-amp} ${step*2},0 q${step},${amp} ${step*2},0`;
  return (
    <g>
      <rect x={bx} y={by} width={boxW} height={boxH} rx={7}
        fill={C.PLATE} stroke={active?col+"77":C.EDGE} strokeWidth={2}/>
      {[[bx+6,by+6],[bx+boxW-6,by+6],[bx+6,by+boxH-6],[bx+boxW-6,by+boxH-6]].map(([px,py],i)=>
        <circle key={i} cx={px} cy={py} r={3} fill={active?col:C.EDGE} opacity={.7}/>)}
      <circle cx={cx} cy={cy} r={r+5} fill={C.STEEL} stroke={active?col+"88":C.EDGE} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={r}   fill="#0A1420" stroke={active?col:C.EDGE} strokeWidth={1.5}/>
      <text x={cx} y={cy+fs*0.36} textAnchor="middle" fontSize={fs} fontWeight="700"
        fill={active?col:C.DIM} fontFamily="'Courier New',monospace" letterSpacing="-.05em">M</text>
      <path d={wavePath} fill="none" stroke={active?col:C.DIM} strokeWidth={1.2} opacity={.7}/>
      {active && <circle cx={cx} cy={cy} r={r+5} fill="none" stroke={col} strokeWidth={1} opacity={0}>
        <animate attributeName="opacity" values=".5;0;.5" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="r" values={`${r+5};${r+14};${r+5}`} dur="2s" repeatCount="indefinite"/>
      </circle>}
      {/* LEFT stub — IN */}
      <rect x={bx-14} y={cy-6} width={14} height={12} rx={2}
        fill={active?col+"33":C.DIM} stroke={active?col:C.EDGE} strokeWidth={1}/>
      <text x={bx-7} y={cy-10} textAnchor="middle" fontSize={7} fontWeight="700"
        fill={active?col:C.DIM} fontFamily="'Courier New',monospace">IN</text>
      {/* RIGHT stub — OUT */}
      <rect x={bx+boxW} y={cy-6} width={14} height={12} rx={2}
        fill={active?col+"33":C.DIM} stroke={active?col:C.EDGE} strokeWidth={1}/>
      <text x={bx+boxW+7} y={cy-10} textAnchor="middle" fontSize={7} fontWeight="700"
        fill={active?col:C.DIM} fontFamily="'Courier New',monospace">OUT</text>
      <text x={cx} y={by-9} textAnchor="middle" fontSize={9} fontWeight="700"
        letterSpacing=".1em" fill={active?col:C.TEXT} fontFamily="'Courier New',monospace">{label}</text>
      <ValBadge x={cx} y={by+boxH+16} value={pct} unit="%" col={active?C.WARN:C.DIM} small/>
    </g>
  );
}

function ConnBox({ x, y, w, h, label, active, col }) {
  return (
    <g>
      <rect x={x} y={y-h/2} width={w} height={h} rx={4}
        fill={active?C.PLATE:C.STEEL} stroke={active?col:C.EDGE} strokeWidth={active?2:1}/>
      {[[x,y-h/2],[x+w,y-h/2],[x,y+h/2],[x+w,y+h/2]].map(([cx2,cy2],i)=>
        <rect key={i} x={cx2-4} y={cy2-4} width={8} height={8} fill={active?col:C.EDGE} rx={1}/>)}
      <text x={x+w/2} y={y+4} textAnchor="middle" fontSize={9} fontWeight="700"
        letterSpacing=".1em" fill={active?col:C.TEXT} fontFamily="'Courier New',monospace">{label}</text>
    </g>
  );
}

function SvgLabel({ x, y, text, col, small=false }) {
  return <text x={x} y={y} textAnchor="middle" fontSize={small?7.5:9}
    fontWeight="700" letterSpacing=".1em" fill={col} fontFamily="'Courier New',monospace">{text}</text>;
}

// ─── Main Schematic ───────────────────────────────────────────────────────────
function Schematic({ d }) {
  const on      = d.status==="ON";
  const ventOn  = on && d.Ventilator>0;
  const aspOn   = on && d.Aspirator>0;
  const boilOn  = on && d.Boil_Valve>0;
  const chillOn = on && d.Chiller_Valve>0;
  const anyOn   = on;

  // ── layout ──────────────────────────────────────────────────────────────
  // viewBox is 760×500 — tight zoom so everything reads large
  const VW=860, VH=500;

  // AIR DUCTS
  const RET_Y=88,  SUP_Y=192, DH=50;
  const CX_X=58,   CX_W=76;
  const CX_T=RET_Y-DH/2-4, CX_B=SUP_Y+DH/2+4;
  const CH_SUP=CX_X+21, CH_RET=CX_X+56;
  const HY_X=12,   HY_W=35;
  const DIN_X=HY_X+HY_W+7, DOUT_X=HY_X+HY_W+7, DAMP_W=23;
  const DUCT_START=CX_X+CX_W+7;
  const FAN_X=DUCT_START+8, FAN_W=84;

  // Pump box half-width = radius*2+64 / 2 = 52px + 26px enclosure padding = 78px from pump center
  // BOILER pump center X ≈ 327 → enclosure right edge = 327+52+26 = 405
  // Gap = 40px → CHILLER enclosure left = 445 → CHILLER pump center = 445+52+26 = 523 → CHILL_X = 523-32 = 491
  const BOIL_X=282,  BOIL_W=78;
  const CHILL_X=490, CHILL_W=78;   // 490-(282+78)=130px gap between coils on duct
  const F3_X=582,    F3_W=20;
  const DP_X=614;
  const CONN_X=646,  CONN_W=56;
  const ROOM_X=714,  ROOM_W=112;
  const ROOM_H=SUP_Y+DH/2-(RET_Y-DH/2)+8;
  const ROOM_Y=RET_Y-DH/2-4;
  const LOOP_TOP=SUP_Y+DH/2+6;

  // BOILER PUMP
  const B_PL = BOIL_X+14;
  const B_PR = BOIL_X+BOIL_W-14;
  const B_PCX= (B_PL+B_PR)/2;   // ≈ 327
  const B_PR_= 20;
  const B_PCY= LOOP_TOP+165;
  const B_PBW= (B_PR_*2+64)/2;  // = 52

  // CHILLER PUMP — pump center ≈ 523, enclosure left = 523-52-26=445, boiler enclosure right=327+52+26=405 → gap=40px ✓
  const C_PL = CHILL_X+14;
  const C_PR = CHILL_X+CHILL_W-14;
  const C_PCX= (C_PL+C_PR)/2;   // ≈ 523
  const C_PR_= 20;
  const C_PCY= LOOP_TOP+165;
  const C_PBW= (C_PR_*2+64)/2;

  const mid=(CX_T+CX_B)/2;
  const py1=RET_Y+DH/2+5, py2=SUP_Y-DH/2-5, pmid=(py1+py2)/2;
  const dpCol=on?C.WARN:"#2A4A4A";
  const boilDT =boilOn ?Math.round(d.Water_InpBoilTemp -d.Water_OutputBoilTemp):0;
  const chillDT=chillOn?Math.round(d.Water_outChill_Temp-d.Water_InpChillTemp):0;

  // helper: valve mid-Y on left pipe
  const B_VCY = LOOP_TOP + (B_PCY - B_PR_ - 28 - LOOP_TOP)/2;
  const C_VCY = LOOP_TOP + (C_PCY - C_PR_ - 28 - LOOP_TOP)/2;

  return (
    <svg viewBox={`-90 -10 ${VW+90} ${VH}`} width="100%" height="100%"
      preserveAspectRatio="xMidYMid meet" style={{ display:"block" }}>

      {/* defs: arrowhead marker */}
      <defs>
      </defs>

      {/* BG plate */}
      <rect x={8} y={RET_Y-DH/2-20} width={ROOM_X-16}
        height={SUP_Y+DH/2-RET_Y+DH/2+40} rx={6} fill={C.PLATE} stroke={C.EDGE} strokeWidth={1}/>

      {/* ── HEX ── */}
      <rect x={CX_X-4} y={CX_T-4} width={CX_W+8} height={CX_B-CX_T+8}
        rx={6} fill={C.STEEL} stroke={anyOn?"#2A6A5A":C.EDGE} strokeWidth={2}/>
      <rect x={CX_X} y={CX_T} width={CX_W} height={CX_B-CX_T}
        rx={4} fill="#0E1820" stroke={C.EDGE} strokeWidth={1}/>
      <rect x={CH_SUP-9} y={CX_T+5} width={18} height={CX_B-CX_T-10}
        rx={4} fill={aspOn?"#00E5FF0A":"#0A1218"} stroke={aspOn?C.SUP:C.EDGE} strokeWidth={1.5}/>
      <rect x={CH_RET-9} y={CX_T+5} width={18} height={CX_B-CX_T-10}
        rx={4} fill={ventOn?"#FF8C000A":"#0A1218"} stroke={ventOn?C.RET:C.EDGE} strokeWidth={1.5}/>
      {Array.from({length:9}).map((_,i)=>{
        const fy=CX_T+14+i*((CX_B-CX_T-28)/8);
        return <line key={i} x1={CH_SUP+10} y1={fy} x2={CH_RET-10} y2={fy}
          stroke={anyOn?"#2A5A6A":C.EDGE} strokeWidth={1.2} opacity={.6}/>;
      })}
      <polygon points={`${CH_SUP},${mid+9} ${CH_SUP-6},${mid-4} ${CH_SUP+6},${mid-4}`} fill={aspOn?C.SUP:C.EDGE}/>
      <polygon points={`${CH_RET},${mid-9} ${CH_RET-6},${mid+4} ${CH_RET+6},${mid+4}`} fill={ventOn?C.RET:C.EDGE}/>
      <text x={CH_SUP} y={CX_T+15} textAnchor="middle" fontSize={6} fill={aspOn?C.SUP:"#2A5A6A"} fontFamily="'Courier New',monospace">SUP</text>
      <text x={CH_RET} y={CX_T+15} textAnchor="middle" fontSize={6} fill={ventOn?C.RET:"#5A3A1A"} fontFamily="'Courier New',monospace">RET</text>
      <text x={CX_X+CX_W/2} y={CX_T-9} textAnchor="middle" fontSize={9} fontWeight="700"
        letterSpacing=".12em" fill="#4A8A9A" fontFamily="'Courier New',monospace">HEX</text>

      {/* ── AER PROASPĂT — linie intrare din exterior spre Hyrja ── */}
      {/* conductor orizontal din stânga */}
      <Pipe x1={HY_X-60} y1={RET_Y} x2={HY_X} y2={RET_Y} active={aspOn} col={airColor(d.Air_inp_Temp)} w={4}/>
      <FlowLine x1={HY_X-58} y1={RET_Y} x2={HY_X-2} y2={RET_Y} active={aspOn} col={airColor(d.Air_inp_Temp)}/>
      {/* capăt exterior — indicator grilă */}
      <rect x={HY_X-72} y={RET_Y-10} width={14} height={20} rx={3}
        fill={C.STEEL} stroke={aspOn?airColor(d.Air_inp_Temp):C.EDGE} strokeWidth={1.5}/>
      {[0,1,2,3].map(i=>(
        <line key={i} x1={HY_X-72+3} y1={RET_Y-7+i*5} x2={HY_X-72+11} y2={RET_Y-7+i*5}
          stroke={aspOn?airColor(d.Air_inp_Temp):C.EDGE} strokeWidth={1} opacity={.8}/>
      ))}
      {/* label */}
      <text x={HY_X-65} y={RET_Y-14} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={aspOn?airColor(d.Air_inp_Temp):C.DIM}
        fontFamily="'Courier New',monospace">Air</text>
      <text x={HY_X-65} y={RET_Y-22} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={aspOn?airColor(d.Air_inp_Temp):C.DIM}
        fontFamily="'Courier New',monospace">Fresh</text>

      {/* ── AER EVACUAT — linie ieșire din Dalja spre exterior ── */}
      <Pipe x1={HY_X} y1={SUP_Y} x2={HY_X-60} y2={SUP_Y} active={ventOn} col={C.RET} w={4}/>
      <FlowLine x1={HY_X-2} y1={SUP_Y} x2={HY_X-58} y2={SUP_Y} active={ventOn} col={C.RET}/>
      {/* capăt exterior — indicator grilă */}
      <rect x={HY_X-72} y={SUP_Y-10} width={14} height={20} rx={3}
        fill={C.STEEL} stroke={ventOn?C.RET:C.EDGE} strokeWidth={1.5}/>
      {[0,1,2,3].map(i=>(
        <line key={i} x1={HY_X-72+3} y1={SUP_Y-7+i*5} x2={HY_X-72+11} y2={SUP_Y-7+i*5}
          stroke={ventOn?C.RET:C.EDGE} strokeWidth={1} opacity={.8}/>
      ))}
      {/* label */}
      <text x={HY_X-65} y={SUP_Y+22} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={ventOn?C.RET:C.DIM}
        fontFamily="'Courier New',monospace">AER</text>
      <text x={HY_X-65} y={SUP_Y+30} textAnchor="middle" fontSize={6.5} fontWeight="700"
        letterSpacing=".08em" fill={ventOn?C.RET:C.DIM}
        fontFamily="'Courier New',monospace">Exhaust</text>

      {/* ── Hyrja → D-IN → HEX ── */}
      <rect x={HY_X} y={RET_Y-DH/2} width={HY_W} height={DH-7} rx={4}
        fill={aspOn?C.PLATE:C.STEEL} stroke={aspOn?airColor(d.Air_inp_Temp):C.EDGE} strokeWidth={aspOn?1.5:1}/>
      <text x={HY_X+HY_W/2} y={RET_Y+4} textAnchor="middle" fontSize={7} fontWeight="700"
        fill={aspOn?airColor(d.Air_inp_Temp):C.TEXT} fontFamily="'Courier New',monospace">Hyrja</text>
      <ValBadge x={HY_X+HY_W/2} y={RET_Y-DH/2-15} value={d.Air_inp_Temp} unit="°C" col={airColor(d.Air_inp_Temp)} small/>
      <Dot x={HY_X+HY_W-5} y={RET_Y-DH/2+5} col={airColor(d.Air_inp_Temp)} active={aspOn}/>
      <Pipe x1={HY_X+HY_W} y1={RET_Y} x2={DIN_X} y2={RET_Y} active={aspOn} col={C.SUP} w={3}/>
      <FlowLine x1={HY_X+HY_W+2} y1={RET_Y} x2={DIN_X-2} y2={RET_Y} active={aspOn} col={C.SUP}/>
      <Damper x={DIN_X} y={RET_Y} w={DAMP_W} h={DH-10} pct={d.Inp_Damper} active={on} col={C.SUP}/>
      <SvgLabel x={DIN_X+DAMP_W/2} y={RET_Y-DH/2-9} text="D-IN" col={on?C.SUP:C.TEXT} small/>
      <ValBadge x={DIN_X+DAMP_W/2} y={RET_Y-DH/2-23} value={d.Inp_Damper} unit="%" col={C.SUP} small/>
      <Pipe x1={DIN_X+DAMP_W} y1={RET_Y} x2={CH_SUP} y2={RET_Y} active={aspOn} col={C.SUP} w={3}/>
      <FlowLine x1={DIN_X+DAMP_W+2} y1={RET_Y} x2={CH_SUP-2} y2={RET_Y} active={aspOn} col={C.SUP}/>
      <Pipe x1={CH_SUP} y1={RET_Y} x2={CH_SUP} y2={CX_T} active={aspOn} col={C.SUP} w={3}/>
      <FlowLine x1={CH_SUP} y1={RET_Y+2} x2={CH_SUP} y2={CX_T-2} active={aspOn} col={C.SUP}/>
      <FlowLine x1={CH_SUP} y1={CX_T+7} x2={CH_SUP} y2={CX_B-7} active={aspOn} col={C.SUP}/>
      <Pipe x1={CH_SUP} y1={CX_B} x2={CH_SUP} y2={SUP_Y} active={aspOn} col={C.SUP} w={3}/>
      <Pipe x1={CH_SUP} y1={SUP_Y} x2={DUCT_START} y2={SUP_Y} active={aspOn} col={C.SUP} w={3}/>
      <FlowLine x1={CH_SUP+2} y1={CX_B} x2={CH_SUP+2} y2={SUP_Y-2} active={aspOn} col={C.SUP}/>
      <FlowLine x1={CH_SUP+2} y1={SUP_Y} x2={DUCT_START-2} y2={SUP_Y} active={aspOn} col={C.SUP}/>

      {/* ── HEX → D-OUT → Dalja ── */}
      <rect x={HY_X} y={SUP_Y-DH/2+5} width={HY_W} height={DH-7} rx={4}
        fill={ventOn?C.PLATE:C.STEEL} stroke={ventOn?C.RET:C.EDGE} strokeWidth={ventOn?1.5:1}/>
      <text x={HY_X+HY_W/2} y={SUP_Y+5} textAnchor="middle" fontSize={7} fontWeight="700"
        fill={ventOn?C.RET:C.TEXT} fontFamily="'Courier New',monospace">Dalja</text>
      <Dot x={HY_X+HY_W-5} y={SUP_Y-DH/2+11} col={C.RET} active={ventOn}/>
      <Pipe x1={HY_X+HY_W} y1={SUP_Y} x2={DOUT_X} y2={SUP_Y} active={ventOn} col={C.RET} w={3}/>
      <FlowLine x1={DOUT_X-2} y1={SUP_Y} x2={HY_X+HY_W+2} y2={SUP_Y} active={ventOn} col={C.RET}/>
      <Damper x={DOUT_X} y={SUP_Y} w={DAMP_W} h={DH-10} pct={d.Output_Damper} active={on} col={C.RET}/>
      <SvgLabel x={DOUT_X+DAMP_W/2} y={SUP_Y+DH/2+13} text="D-OUT" col={on?C.RET:C.TEXT} small/>
      <ValBadge x={DOUT_X+DAMP_W/2} y={SUP_Y+DH/2+27} value={d.Output_Damper} unit="%" col={C.RET} small/>
      <Pipe x1={DOUT_X+DAMP_W} y1={SUP_Y} x2={CH_RET} y2={SUP_Y} active={ventOn} col={C.RET} w={3}/>
      <FlowLine x1={CH_RET-2} y1={SUP_Y} x2={DOUT_X+DAMP_W+2} y2={SUP_Y} active={ventOn} col={C.RET}/>
      <Pipe x1={CH_RET} y1={CX_B} x2={CH_RET} y2={SUP_Y} active={ventOn} col={C.RET} w={3}/>
      <FlowLine x1={CH_RET} y1={CX_B+2} x2={CH_RET} y2={SUP_Y-2} active={ventOn} col={C.RET}/>
      <FlowLine x1={CH_RET} y1={CX_B-7} x2={CH_RET} y2={CX_T+7} active={ventOn} col={C.RET}/>
      <Pipe x1={CH_RET} y1={RET_Y} x2={CH_RET} y2={CX_T} active={ventOn} col={C.RET} w={3}/>
      <FlowLine x1={CH_RET} y1={RET_Y-2} x2={CH_RET} y2={CX_T+2} active={ventOn} col={C.RET}/>
      <Pipe x1={DUCT_START} y1={RET_Y} x2={CH_RET} y2={RET_Y} active={ventOn} col={C.RET} w={3}/>
      <FlowLine x1={CH_RET-2} y1={RET_Y} x2={DUCT_START+2} y2={RET_Y} active={ventOn} col={C.RET}/>

      {/* ── RETURN DUCT (top) ── */}
      <rect x={DUCT_START-3} y={RET_Y-DH/2-3} width={CONN_X+CONN_W-DUCT_START+6}
        height={DH+6} rx={3} fill={C.PLATE} stroke={ventOn?C.RET+"66":C.EDGE} strokeWidth={2}/>
      <rect x={DUCT_START} y={RET_Y-DH/2+1} width={CONN_X+CONN_W-DUCT_START}
        height={DH-2} rx={2} fill={C.STEEL}/>
      <Pipe x1={DUCT_START} y1={RET_Y} x2={CONN_X+CONN_W} y2={RET_Y} active={ventOn} col={C.RET} w={2.5} dash="6 2"/>
      <FlowLine x1={CONN_X-3} y1={RET_Y} x2={FAN_X+FAN_W+3} y2={RET_Y} active={ventOn} col={C.RET}/>
      <FlowLine x1={FAN_X-4} y1={RET_Y} x2={DUCT_START+4} y2={RET_Y} active={ventOn} col={C.RET}/>

      {/* ── SUPPLY DUCT (bottom) ── */}
      <rect x={DUCT_START-3} y={SUP_Y-DH/2-3} width={CONN_X+CONN_W-DUCT_START+6}
        height={DH+6} rx={3} fill={C.PLATE} stroke={aspOn?C.SUP+"66":C.EDGE} strokeWidth={2}/>
      <rect x={DUCT_START} y={SUP_Y-DH/2+1} width={CONN_X+CONN_W-DUCT_START}
        height={DH-2} rx={2} fill={C.STEEL}/>
      <Pipe x1={DUCT_START} y1={SUP_Y} x2={CONN_X+CONN_W} y2={SUP_Y} active={aspOn} col={C.SUP} w={2.5} dash="6 2"/>
      <FlowLine x1={DUCT_START+3} y1={SUP_Y} x2={FAN_X-4} y2={SUP_Y} active={aspOn} col={C.SUP}/>
      <FlowLine x1={FAN_X+FAN_W+2} y1={SUP_Y} x2={BOIL_X-3} y2={SUP_Y} active={aspOn} col={C.SUP}/>
      <FlowLine x1={BOIL_X+BOIL_W+2} y1={SUP_Y} x2={CHILL_X-3} y2={SUP_Y}
        active={aspOn||boilOn} col={boilOn?airColor(d.Water_OutputBoilTemp):C.SUP}/>
      <FlowLine x1={CHILL_X+CHILL_W+2} y1={SUP_Y} x2={F3_X-3} y2={SUP_Y}
        active={aspOn} col={airColor(d.Air_Output_Temp)}/>
      <FlowLine x1={F3_X+F3_W+2} y1={SUP_Y} x2={CONN_X-3} y2={SUP_Y}
        active={aspOn} col={airColor(d.Air_Output_Temp)}/>

      {/* ── ASPIRATOR ── */}
      <Fan cx={FAN_X+FAN_W/2} cy={RET_Y} r={26} active={aspOn} col={C.RET}/>
      <SvgLabel x={FAN_X+FAN_W/2} y={RET_Y-DH/2-11} text="ASPIRATOR" col={aspOn?C.RET:C.TEXT}/>
      <ValBadge x={FAN_X+FAN_W/2} y={RET_Y-DH/2-27} value={d.Aspirator} unit="%" col={C.RET} small/>
      <Dot x={FAN_X+7} y={RET_Y-DH/2+5} col="#FF3333" active={aspOn}/>

      {/* ── VENTILATOR ── */}
      <Fan cx={FAN_X+FAN_W/2} cy={SUP_Y} r={26} active={ventOn} col={C.SUP}/>
      <SvgLabel x={FAN_X+FAN_W/2} y={SUP_Y+DH/2+13} text="VENTILATOR" col={ventOn?C.SUP:C.TEXT}/>
      <ValBadge x={FAN_X+FAN_W/2} y={SUP_Y+DH/2+28} value={d.Ventilator} unit="%" col={C.SUP} small/>
      <Dot x={FAN_X+7} y={SUP_Y-DH/2+5} col="#FF3333" active={ventOn}/>
      <line x1={FAN_X+FAN_W/2} y1={RET_Y+DH/2} x2={FAN_X+FAN_W/2} y2={SUP_Y-DH/2}
        stroke="#2A5A6A" strokeWidth={1} strokeDasharray="4 4" opacity={.5}/>

      {/* ── BOILER COIL ── */}
      <Coil x={BOIL_X} y={SUP_Y} w={BOIL_W} h={DH-9} active={boilOn} col={C.BOIL}/>
      <SvgLabel x={BOIL_X+BOIL_W/2} y={SUP_Y+DH/2+13} text="BOILER" col={boilOn?C.BOIL:C.TEXT}/>
      <Dot x={BOIL_X+7} y={SUP_Y-DH/2+5} col={C.BOIL} active={boilOn}/>
      {boilOn && <>
        <line x1={BOIL_X+BOIL_W/2} y1={RET_Y+DH/2} x2={BOIL_X+BOIL_W/2}
          y2={(RET_Y+SUP_Y)/2+7} stroke={C.BOIL} strokeWidth={1} strokeDasharray="3 3" opacity={.6}/>
        <text x={BOIL_X+BOIL_W/2} y={(RET_Y+SUP_Y)/2+18} textAnchor="middle"
          fontSize={9} fontWeight="700" fill={C.BOIL} fontFamily="'Courier New',monospace">+{boilDT}°C</text>
      </>}

      {/* ── CHILLER COIL ── */}
      <Coil x={CHILL_X} y={SUP_Y} w={CHILL_W} h={DH-9} active={chillOn} col={C.CHILL}/>
      <SvgLabel x={CHILL_X+CHILL_W/2} y={SUP_Y+DH/2+13} text="CHILLER" col={chillOn?C.CHILL:C.TEXT}/>
      <Dot x={CHILL_X+7} y={SUP_Y-DH/2+5} col={C.CHILL} active={chillOn}/>
      {chillOn && <>
        <line x1={CHILL_X+CHILL_W/2} y1={RET_Y+DH/2} x2={CHILL_X+CHILL_W/2}
          y2={(RET_Y+SUP_Y)/2+7} stroke={C.CHILL} strokeWidth={1} strokeDasharray="3 3" opacity={.6}/>
        <text x={CHILL_X+CHILL_W/2} y={(RET_Y+SUP_Y)/2+18} textAnchor="middle"
          fontSize={9} fontWeight="700" fill={C.CHILL} fontFamily="'Courier New',monospace">-{chillDT}°C</text>
      </>}

      {/* ── FILTER F3 ── */}
      <Filter x={F3_X} y={SUP_Y} w={F3_W} h={DH-9} active={aspOn} col={C.SUP}/>
      <SvgLabel x={F3_X+F3_W/2} y={SUP_Y+DH/2+13} text="F3" col={aspOn?C.SUP:C.TEXT} small/>

      {/* ── ΔP ── */}
      <line x1={DP_X} y1={py1} x2={DP_X} y2={py2} stroke={dpCol} strokeWidth={2} strokeDasharray="5 3"/>
      <polygon points={`${DP_X},${py2} ${DP_X-5},${py2+10} ${DP_X+5},${py2+10}`} fill={dpCol}/>
      <polygon points={`${DP_X},${py1} ${DP_X-5},${py1-10} ${DP_X+5},${py1-10}`} fill={dpCol}/>
      <rect x={DP_X-22} y={pmid-14} width={44} height={28} rx={4} fill={C.STEEL} stroke={dpCol} strokeWidth={1.5}/>
      <text x={DP_X} y={pmid-1} textAnchor="middle" fontSize={10} fontWeight="700"
        fill={dpCol} fontFamily="'Courier New',monospace">ΔP</text>
      <text x={DP_X} y={pmid+11} textAnchor="middle" fontSize={8}
        fill={dpCol} fontFamily="'Courier New',monospace">{on?`${d.Out_Return_Pressure}b`:"—"}</text>

      {/* ── CONN BOXES ── */}
      <ConnBox x={CONN_X} y={RET_Y} w={CONN_W} h={DH-10} label="Kthimi" active={ventOn} col={C.RET}/>
      <Dot x={CONN_X+7} y={RET_Y-DH/2+7} col={C.RET} active={ventOn}/>
      <ValBadge x={CONN_X+CONN_W/2} y={RET_Y-DH/2-13} value={d.Air_Return_Temp} unit="°C"
        col={airColor(d.Air_Return_Temp)} small/>

      <ConnBox x={CONN_X} y={SUP_Y} w={CONN_W} h={DH-10} label="Dërgimi" active={aspOn} col={C.SUP}/>
      <Dot x={CONN_X+7} y={SUP_Y-DH/2+7} col={C.SUP} active={aspOn}/>
      <ValBadge x={CONN_X+CONN_W/2} y={SUP_Y+DH/2+13} value={d.Air_Output_Temp} unit="°C"
        col={airColor(d.Air_Output_Temp)} small/>
      {/* RH badge */}
      <g>
        <rect x={CONN_X} y={SUP_Y+DH/2+29} width={CONN_W} height={17} rx={3}
          fill={C.STEEL} stroke="#88BBFF" strokeWidth={1}/>
        <text x={CONN_X+CONN_W/2} y={SUP_Y+DH/2+41} textAnchor="middle"
          fontSize={8} fontWeight="700" fill="#88BBFF"
          fontFamily="'Courier New',monospace">RH {d.Air_outHygro}%</text>
      </g>

      {/* ── ROOM ── */}
      <Pipe x1={CONN_X+CONN_W} y1={RET_Y} x2={ROOM_X} y2={RET_Y} active={ventOn} col={C.RET}/>
      <Pipe x1={CONN_X+CONN_W} y1={SUP_Y} x2={ROOM_X} y2={SUP_Y} active={aspOn} col={C.SUP}/>
      <FlowLine x1={ROOM_X-2} y1={RET_Y} x2={CONN_X+CONN_W+2} y2={RET_Y} active={ventOn} col={C.RET}/>
      <FlowLine x1={CONN_X+CONN_W+2} y1={SUP_Y} x2={ROOM_X-2} y2={SUP_Y} active={aspOn} col={C.SUP}/>
      <rect x={ROOM_X} y={ROOM_Y} width={ROOM_W} height={ROOM_H} rx={6}
        fill={anyOn?"#111E28":"#0C1520"} stroke={anyOn?"#2A6A5A":C.EDGE} strokeWidth={2}/>
      <text x={ROOM_X+ROOM_W/2} y={ROOM_Y+ROOM_H/2-7} textAnchor="middle" fontSize={10}
        fontWeight="700" letterSpacing=".14em" fill={anyOn?C.HEAD:C.TEXT} fontFamily="'Courier New',monospace">ROOM</text>
      <text x={ROOM_X+ROOM_W/2} y={ROOM_Y+ROOM_H/2+9} textAnchor="middle" fontSize={9}
        fontWeight="700" fill={airColor(d.Air_Output_Temp)} fontFamily="'Courier New',monospace">
        {d.Air_Output_Temp}°C
      </text>

      {/* ══════════════════════════════════════════════════
          BOILER LOOP
          Left pipe  = supply IN  (hot water → coil) ↑
          Right pipe = return OUT (cooled ← coil)    ↓
          Pump at bottom: left=IN stub, right=OUT stub
          ══════════════════════════════════════════════════ */}
      {/* enclosure */}
      <rect x={B_PL-26} y={LOOP_TOP-6} width={B_PR-B_PL+52}
        height={B_PCY+B_PR_+44-LOOP_TOP} rx={8}
        fill={boilOn?C.BOIL+"0B":"#080808"}
        stroke={boilOn?C.BOIL+"66":C.EDGE} strokeWidth={1.5}
        strokeDasharray={boilOn?"none":"6 3"}/>
    

      {/* left pipe: apă caldă urcă pompa→coil  (y merge sus) */}
      <Pipe x1={B_PL} y1={LOOP_TOP} x2={B_PL} y2={B_PCY-B_PR_-28} active={boilOn} col={C.BOIL} w={5}/>
      <FlowLine x1={B_PL} y1={B_PCY-B_PR_-30} x2={B_PL} y2={LOOP_TOP+6} active={boilOn} col={C.BOIL}/>
      <circle cx={B_PL} cy={LOOP_TOP} r={6} fill={boilOn?C.BOIL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>

      {/* BOILER VALVE on left pipe */}
      <WaterValve cx={B_PL} cy={B_VCY} r={11} pct={d.Boil_Valve} active={boilOn} col={C.BOIL}/>
      <rect x={B_PL+15} y={B_VCY-9} width={56} height={18} rx={3}
        fill={C.STEEL} stroke={boilOn?C.BOIL+"88":C.EDGE} strokeWidth={1}/>
      <text x={B_PL+43} y={B_VCY+4} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={boilOn?C.BOIL:C.DIM} fontFamily="'Courier New',monospace">Valve</text>

      {/* right pipe: apă răcită coboară coil→pompă  (y merge jos) */}
      <Pipe x1={B_PR} y1={LOOP_TOP} x2={B_PR} y2={B_PCY-B_PR_-28} active={boilOn} col={C.BOIL} w={5}/>
      <FlowLine x1={B_PR} y1={LOOP_TOP+6} x2={B_PR} y2={B_PCY-B_PR_-30} active={boilOn} col={C.BOIL}/>
      <circle cx={B_PR} cy={LOOP_TOP} r={6} fill={boilOn?C.BOIL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>

      {/* orizontală stânga: B_PL → pump IN  (stânga→dreapta) */}
      <Pipe x1={B_PL} y1={B_PCY} x2={B_PCX-B_PBW-14} y2={B_PCY} active={boilOn} col={C.BOIL} w={5}/>
      <FlowLine x1={B_PL+4} y1={B_PCY} x2={B_PCX-B_PBW-16} y2={B_PCY} active={boilOn} col={C.BOIL}/>
      {/* orizontală dreapta: pump OUT → B_PR  (stânga→dreapta) */}
      <Pipe x1={B_PCX+B_PBW+14} y1={B_PCY} x2={B_PR} y2={B_PCY} active={boilOn} col={C.BOIL} w={5}/>
      <FlowLine x1={B_PCX+B_PBW+16} y1={B_PCY} x2={B_PR-4} y2={B_PCY} active={boilOn} col={C.BOIL}/>
      <circle cx={B_PL} cy={B_PCY} r={6} fill={boilOn?C.BOIL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>
      <circle cx={B_PR} cy={B_PCY} r={6} fill={boilOn?C.BOIL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>

      {/* water temps — offset left/right from pipe so they don't overlap */}
      <ValBadge x={B_PL-30} y={LOOP_TOP+28} value={d.Water_InpBoilTemp} unit="°C" col={boilOn?C.BOIL:"#2A1A08"}/>
      <ValBadge x={B_PR+30} y={LOOP_TOP+28} value={d.Water_OutputBoilTemp} unit="°C" col={boilOn?C.BOIL:"#2A1A08"}/>
      <text x={B_PL-30} y={LOOP_TOP+11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={boilOn?C.BOIL:"#2A1A08"} fontFamily="'Courier New',monospace">W.IN</text>
      <text x={B_PR+30} y={LOOP_TOP+11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={boilOn?C.BOIL:"#2A1A08"} fontFamily="'Courier New',monospace">W.OUT</text>

      <PumpDevice cx={B_PCX} cy={B_PCY} r={B_PR_} active={boilOn} col={C.BOIL}
        pct={d.Boil_Pump_Invert} label="PUMP"/>


      {/* ══════════════════════════════════════════════════
          CHILLER LOOP — separated from boiler loop
          CHILLER_X=390 vs BOIL_X+BOIL_W=288+78=366 → 24px gap between coils
          Pump boxes also separated by this gap
          ══════════════════════════════════════════════════ */}
      {/* enclosure */}
      <rect x={C_PL-26} y={LOOP_TOP-6} width={C_PR-C_PL+52}
        height={C_PCY+C_PR_+44-LOOP_TOP} rx={8}
        fill={chillOn?C.CHILL+"0B":"#080808"}
        stroke={chillOn?C.CHILL+"66":C.EDGE} strokeWidth={1.5}
        strokeDasharray={chillOn?"none":"6 3"}/>
      

      {/* left pipe: supply IN — flow UP into coil */}
      <Pipe x1={C_PL} y1={LOOP_TOP} x2={C_PL} y2={C_PCY-C_PR_-28} active={chillOn} col={C.CHILL} w={5}/>
      <FlowLine x1={C_PL} y1={C_PCY-C_PR_-30} x2={C_PL} y2={LOOP_TOP+6} active={chillOn} col={C.CHILL}/>
      <circle cx={C_PL} cy={LOOP_TOP} r={6} fill={chillOn?C.CHILL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>

      {/* CHILLER VALVE on left pipe */}
      <WaterValve cx={C_PL} cy={C_VCY} r={11} pct={d.Chiller_Valve} active={chillOn} col={C.CHILL}/>
      <rect x={C_PL+15} y={C_VCY-9} width={70} height={18} rx={3}
        fill={C.STEEL} stroke={chillOn?C.CHILL+"88":C.EDGE} strokeWidth={1}/>
      <text x={C_PL+50} y={C_VCY+4} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={chillOn?C.CHILL:C.DIM} fontFamily="'Courier New',monospace">Valve</text>

      {/* right pipe: return OUT — flow DOWN from coil */}
      <Pipe x1={C_PR} y1={LOOP_TOP} x2={C_PR} y2={C_PCY-C_PR_-28} active={chillOn} col={C.CHILL} w={5}/>
      <FlowLine x1={C_PR} y1={LOOP_TOP+6} x2={C_PR} y2={C_PCY-C_PR_-30} active={chillOn} col={C.CHILL}/>
      <circle cx={C_PR} cy={LOOP_TOP} r={6} fill={chillOn?C.CHILL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>

      {/* horizontal pipes at pump level */}
      <Pipe x1={C_PL} y1={C_PCY} x2={C_PCX-C_PBW-14} y2={C_PCY} active={chillOn} col={C.CHILL} w={5}/>
      <FlowLine x1={C_PL+4} y1={C_PCY} x2={C_PCX-C_PBW-16} y2={C_PCY} active={chillOn} col={C.CHILL}/>
      <Pipe x1={C_PCX+C_PBW+14} y1={C_PCY} x2={C_PR} y2={C_PCY} active={chillOn} col={C.CHILL} w={5}/>
      <FlowLine x1={C_PCX+C_PBW+16} y1={C_PCY} x2={C_PR-4} y2={C_PCY} active={chillOn} col={C.CHILL}/>
      <circle cx={C_PL} cy={C_PCY} r={6} fill={chillOn?C.CHILL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>
      <circle cx={C_PR} cy={C_PCY} r={6} fill={chillOn?C.CHILL:C.EDGE} stroke={C.STEEL} strokeWidth={1.5}/>

      {/* water temps — offset left/right from pipe so they don't overlap */}
      <ValBadge x={C_PL-30} y={LOOP_TOP+28} value={d.Water_InpChillTemp} unit="°C" col={chillOn?C.CHILL:"#081828"}/>
      <ValBadge x={C_PR+30} y={LOOP_TOP+28} value={d.Water_outChill_Temp} unit="°C" col={chillOn?C.CHILL:"#081828"}/>
      <text x={C_PL-30} y={LOOP_TOP+11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={chillOn?C.CHILL:"#081828"} fontFamily="'Courier New',monospace">W.IN</text>
      <text x={C_PR+30} y={LOOP_TOP+11} textAnchor="middle" fontSize={8} fontWeight="700"
        fill={chillOn?C.CHILL:"#081828"} fontFamily="'Courier New',monospace">W.OUT</text>

      <PumpDevice cx={C_PCX} cy={C_PCY} r={C_PR_} active={chillOn} col={C.CHILL}
        pct={d.Chiller_Pump_invert} label="PUMP"/>

    </svg>
  );
}

// ─── Sensor Table ─────────────────────────────────────────────────────────────
function SensorTable({ d }) {
  const on=d.status==="ON", boilOn=on&&d.Boil_Valve>0, chillOn=on&&d.Chiller_Valve>0;
  const groups = [
    { label:"AIR TEMPS", col:airColor(d.Air_Output_Temp), active:on, rows:[
      { k:"Air_inp_Temp",    v:`${d.Air_inp_Temp}°C` },
      { k:"Air_Output_Temp", v:`${d.Air_Output_Temp}°C` },
      { k:"Air_Return_Temp", v:`${d.Air_Return_Temp}°C` },
      { k:"Air_outHygro",    v:`${d.Air_outHygro}%` },
    ]},
    { label:"WATER TEMPS", col:boilOn?C.BOIL:chillOn?C.CHILL:C.TEXT, active:boilOn||chillOn, rows:[
      { k:"Water_InpBoilTemp",    v:`${d.Water_InpBoilTemp}°C` },
      { k:"Water_OutputBoilTemp", v:`${d.Water_OutputBoilTemp}°C` },
      { k:"Water_InpChillTemp",   v:`${d.Water_InpChillTemp}°C` },
      { k:"Water_outChill_Temp",  v:`${d.Water_outChill_Temp}°C` },
    ]},
    { label:"ACTUATORS", col:C.WARN, active:on, rows:[
      { k:"Boil_Valve",    v:`${d.Boil_Valve}%` },
      { k:"Chiller_Valve", v:`${d.Chiller_Valve}%` },
      { k:"Inp_Damper",    v:`${d.Inp_Damper}%` },
      { k:"Output_Damper", v:`${d.Output_Damper}%` },
    ]},
    { label:"DRIVES & STATUS", col:C.OK, active:on, rows:[
      { k:"Ventilator",          v:`${d.Ventilator}%` },
      { k:"Aspirator",           v:`${d.Aspirator}%` },
      { k:"Boil_Pump_Invert",    v:`${d.Boil_Pump_Invert}%` },
      { k:"Chiller_Pump_invert", v:`${d.Chiller_Pump_invert}%` },
      { k:"Out_Return_Pressure", v:`${d.Out_Return_Pressure} bar` },
      { k:"Power_Status",        v:d.Power_Status },
      { k:"Sezon_Modality",      v:d.Sezon_Modality },
    ]},
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
      borderTop:`2px solid ${C.EDGE}`, background:"#0C1520", flexShrink:0 }}>
      {groups.map(({ label, col, active, rows }, idx) => (
        <div key={label} style={{ padding:"7px 12px", borderLeft:idx>0?`1px solid ${C.EDGE}`:"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            marginBottom:5, paddingBottom:4, borderBottom:`1px solid ${C.EDGE}` }}>
            <div style={{ width:7, height:7, borderRadius:"50%",
              background:active?col:C.EDGE, boxShadow:active?`0 0 5px ${col}`:"none" }}/>
            <span style={{ fontSize:7, color:active?col:C.TEXT, fontWeight:700, letterSpacing:".12em" }}>{label}</span>
            <span style={{ marginLeft:"auto", fontSize:6, color:active?C.OK:"#2A4A3A", letterSpacing:".1em" }}>
              {active?"● ACT":"○ STB"}
            </span>
          </div>
          {rows.map(({ k, v }) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"baseline", marginBottom:3 }}>
              <span style={{ fontSize:6, color:"#3A6A7A", letterSpacing:".04em" }}>{k}</span>
              <span style={{ fontSize:8.5, fontWeight:700, color:active?col:C.TEXT, letterSpacing:".04em" }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AhuDashboard() {
  const [selId, setSelId] = useState(UNITS[0].id);
  const d = UNITS.find(u=>u.id===selId)??UNITS[0];
  const on=d.status==="ON", boilOn=on&&d.Boil_Valve>0, chillOn=on&&d.Chiller_Valve>0;
  const anyOn=on, allOn=on&&(boilOn||chillOn);
  const statusText=allOn?"ALL SYSTEMS ACTIVE":anyOn?"PARTIAL OPERATION":"STANDBY";
  const statusColor=allOn?C.OK:anyOn?C.WARN:"#3A5A5A";
  const seasonColor=d.Sezon_Modality==="HEATING"?C.BOIL:d.Sezon_Modality==="COOLING"?C.CHILL:"#4A8A7A";

  return (
    <div style={{ fontFamily:"'Courier New',monospace",
      background:"linear-gradient(160deg,#0E1820 0%,#121E28 100%)",
      border:`1px solid ${C.EDGE}`, overflow:"hidden", width:"100%",
      display:"flex", flexDirection:"column", height:"100vh" }}>
      <style>{`
        @keyframes ahuFlow  { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
        @keyframes ahuBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .ahu-blink { animation:ahuBlink 1s infinite; }
      `}</style>

      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"stretch",
        borderBottom:`2px solid ${C.EDGE}`, background:"#0C1520", flexShrink:0 }}>
        <div style={{ padding:"6px 16px", borderRight:`1px solid ${C.EDGE}`, minWidth:180 }}>
          <div style={{ fontSize:6.5, color:"#4A7A8A", letterSpacing:".2em", marginBottom:2 }}>BUILDING MANAGEMENT SYSTEM</div>
          <div style={{ fontSize:14, color:C.HEAD, fontWeight:700, letterSpacing:".12em" }}>{d.id}</div>
          <div style={{ fontSize:7, color:"#4A7A8A", letterSpacing:".1em", marginTop:1 }}>AIR HANDLING UNIT</div>
        </div>
        <div style={{ flex:1, display:"flex", alignItems:"center", padding:"0 16px", gap:20 }}>
          <select value={selId} onChange={e=>setSelId(e.target.value)}
            style={{ background:"#0C1520", color:C.OK, border:`1px solid #1E4A3A`,
              borderRadius:3, padding:"3px 8px", fontSize:8, fontFamily:"inherit",
              cursor:"pointer", outline:"none", letterSpacing:".08em" }}>
            {UNITS.map(u=>(
              <option key={u.id} value={u.id} style={{ background:"#0C1520", color:u.status==="ON"?C.OK:"#3A5A3A" }}>
                {u.id}  ◆  {u.status}
              </option>
            ))}
          </select>
          <div style={{ display:"flex", gap:12 }}>
            {["PLC","VFD","BMS"].map(l=>(
              <div key={l} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{ width:8, height:8, borderRadius:"50%",
                  background:anyOn?C.OK:"#1A3A2A", boxShadow:anyOn?`0 0 6px ${C.OK}`:"none" }}/>
                <span style={{ fontSize:6.5, color:anyOn?C.OK:"#2A4A3A", letterSpacing:".1em" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"stretch" }}>
          {[
            { l:"SUPPLY", v:`${d.Air_Output_Temp}°C`,      col:airColor(d.Air_Output_Temp) },
            { l:"RETURN", v:`${d.Air_Return_Temp}°C`,       col:airColor(d.Air_Return_Temp) },
            { l:"ΔP",     v:`${d.Out_Return_Pressure} bar`, col:C.WARN },
            { l:"HYGRO",  v:`${d.Air_outHygro}%`,           col:"#88BBFF" },
          ].map(({ l, v, col })=>(
            <div key={l} style={{ padding:"4px 12px", borderLeft:`1px solid ${C.EDGE}`,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
              <div style={{ fontSize:6, color:"#4A7A8A", letterSpacing:".15em" }}>{l}</div>
              <div style={{ fontSize:12, fontWeight:700, color:col, letterSpacing:".05em" }}>{v}</div>
            </div>
          ))}
          <div style={{ padding:"4px 16px", borderLeft:`2px solid ${C.EDGE}`,
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:3, minWidth:140 }}>
            <div style={{ fontSize:6.5, color:"#4A7A8A", letterSpacing:".15em" }}>SYSTEM STATUS</div>
            <div style={{ fontSize:8, color:statusColor, fontWeight:700, letterSpacing:".12em",
              padding:"2px 10px", border:`1px solid ${statusColor}`, borderRadius:2 }}>
              {statusText}
              {anyOn && <span className="ahu-blink" style={{ marginLeft:5 }}>◆</span>}
            </div>
            <div style={{ fontSize:6.5, color:seasonColor, letterSpacing:".1em" }}>{d.Sezon_Modality}</div>
          </div>
        </div>
      </div>

      {/* SCHEMATIC */}
      <div style={{ background:"#0E1820", position:"relative", flex:1, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1,
          backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.1) 2px,rgba(0,0,0,.1) 4px)" }}/>
        <div style={{ position:"relative", zIndex:2, height:"100%" }}>
          <Schematic d={d}/>
        </div>
      </div>

      {/* SENSOR TABLE */}
      <SensorTable d={d}/>
    </div>
  );
} 