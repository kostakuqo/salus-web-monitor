// ─────────────────────────────────────────────────────────────────────────────
// UtaProvider.jsx  —  fix: nu pierde istoricul la refresh + multi-zile corect
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

const UtaContext  = createContext();
const STORAGE_KEY = "uta_history";
const MAX_POINTS  = 288;        // max puncte per zi per UTA
const MAX_DAYS    = 7;          // câte zile de istoric păstrăm
const FETCH_MS    = 30 * 1000; // poll API la 30s

/* ── helpers ──────────────────────────────────────────────────────────────── */
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveHistory(h) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); }
  catch { console.warn("localStorage plin"); }
}

function todayStr() {
  const n = new Date();
  return `${n.getDate().toString().padStart(2,"0")}/${(n.getMonth()+1).toString().padStart(2,"0")}/${n.getFullYear()}`;
}

/** Parsează "DD/MM/YYYY" → Date obiect */
function parseDateStr(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

/** Extrage minutele din zi dintr-un punct: "DD/MM HH:MM" → 0–1439 */
function pointMinutes(pt) {
  const m = (pt.time || "").match(/(\d{2}):(\d{2})$/);
  if (!m) return -1;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Data cutoff: acum - MAX_DAYS zile, la ora 00:00 */
function getCutoffDate() {
  const d = new Date();
  d.setDate(d.getDate() - MAX_DAYS);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ── provider ─────────────────────────────────────────────────────────────── */
export function UtaProvider({ children }) {
  const { authHeaders, logout } = useAuth();

  const [utas,    setUtas]    = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚡ history se încarcă O SINGURĂ DATĂ din localStorage la mount
  // și rămâne în memorie — nu se resetează la fiecare fetch
  const [history, setHistory] = useState(loadHistory);

  const fetchUtas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/uta", { headers: authHeaders() });

      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error("Eroare la fetch");

      const data = await res.json();
      setUtas(data);
      setLoading(false);

      const now     = new Date();
      const today   = todayStr();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const cutoff  = getCutoffDate();

      // timestamp: "DD/MM HH:MM"
      const timestamp = [
        now.getDate().toString().padStart(2,"0"),
        "/",
        (now.getMonth()+1).toString().padStart(2,"0"),
        " ",
        now.getHours().toString().padStart(2,"0"),
        ":",
        now.getMinutes().toString().padStart(2,"0"),
      ].join("");

      setHistory(prev => {
        const updated = { ...prev };
        let changed   = false;

        data.forEach(uta => {
          // 1. ia tot istoricul existent pentru acest UTA
          const existing = updated[uta.id] ?? [];

          // 2. curăță punctele mai vechi de MAX_DAYS zile
          const recentPts = existing.filter(p => {
            const d = parseDateStr(p.date);
            return d && d >= cutoff;
          });

          // 3. găsește ULTIMUL punct din ZIUA DE AZI
          //    NU ultimul din întregul array (care poate fi din altă zi!)
          const todayPts = recentPts.filter(p =>
            p.date === today ||
            (p.time || "").startsWith(today.substring(0, 5))
          );
          const lastPtToday = todayPts[todayPts.length - 1];
          const lastMins    = lastPtToday ? pointMinutes(lastPtToday) : -9999;

          // 4. FILTRU 5 MINUTE — sare dacă nu au trecut 5 min față de ultimul din azi
          if (nowMins - lastMins < 5) return;

          // 5. construiește noul punct
          const newPoint = {
            time: timestamp,
            date: today,
            Air_inp_Temp:          uta.Air_inp_Temp,
            Air_Output_Temp:       uta.Air_Output_Temp,
            Air_Return_Temp:       uta.Air_Return_Temp,
            Air_outHygro:          uta.Air_outHygro,
            Water_InpChillTemp:    uta.Water_InpChillTemp,
            Water_outChill_Temp:   uta.Water_outChill_Temp,
            Water_InpBoilTemp:     uta.Water_InpBoilTemp,
            Water_OutputBoilTemp:  uta.Water_OutputBoilTemp,
            Boil_Pump_Invert:      uta.Boil_Pump_Invert,
            Chiller_Pump_Invert:   uta.Chiller_Pump_Invert,
            Boil_Valve:            uta.Boil_Valve,
            Chiller_Valve:         uta.Chiller_Valve,
            Inp_Damper:            uta.Inp_Damper,
            Output_Damper:         uta.Output_Damper,
            Aspirator:             uta.Aspirator,
            Ventilator:            uta.Ventilator,
            Out_Return_Pressure:   uta.Out_Return_Pressure,
          };

          // 6. păstrează zilele trecute intacte, limitează doar ziua de azi
          const otherDaysPts    = recentPts.filter(p =>
            p.date !== today &&
            !(p.time || "").startsWith(today.substring(0, 5))
          );
          const todayPtsTrimmed = [...todayPts.slice(-MAX_POINTS + 1), newPoint];

          updated[uta.id] = [...otherDaysPts, ...todayPtsTrimmed];
          changed = true;
        });

        if (changed) saveHistory(updated);
        return changed ? updated : prev;
      });

    } catch (err) {
      console.error("Eroare fetch:", err);
      setLoading(false);
    }
  };

  /* ── start / stop ──────────────────────────────────────────────────────── */
  const handleStart = async (utaId) => {
    try {
      const res = await fetch("http://localhost:5000/api/uta/start", {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ utaId }),
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      const d = await res.json();
      if (d.success) setUtas(p => p.map(u => u.id === utaId ? { ...u, status: "ON" } : u));
      return d;
    } catch (err) { console.error("Start failed:", err); throw err; }
  };

  const handleStop = async (utaId) => {
    try {
      const res = await fetch("http://localhost:5000/api/uta/stop", {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ utaId }),
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      const d = await res.json();
      if (d.success) setUtas(p => p.map(u => u.id === utaId ? { ...u, status: "OFF" } : u));
      return d;
    } catch (err) { console.error("Stop failed:", err); throw err; }
  };

  useEffect(() => {
    fetchUtas();
    const iv = setInterval(fetchUtas, FETCH_MS);
    return () => clearInterval(iv);
  }, []);

  const clearHistory = () => { localStorage.removeItem(STORAGE_KEY); setHistory({}); };

  return (
    <UtaContext.Provider value={{
      utas, setUtas, loading,
      refresh: fetchUtas,
      history, clearHistory,
      handleStart, handleStop,
    }}>
      {children}
    </UtaContext.Provider>
  );
}

export const useUta = () => useContext(UtaContext);