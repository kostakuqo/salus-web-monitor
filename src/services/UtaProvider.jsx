import { createContext, useContext, useState, useEffect } from "react";

const UtaContext = createContext();

const STORAGE_KEY = "uta_history";
const MAX_POINTS  = 500;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    console.warn("localStorage plin sau indisponibil");
  }
}

function todayStr() {
  const now = new Date();
  return `${now.getDate().toString().padStart(2,"0")}/${
    (now.getMonth()+1).toString().padStart(2,"0")}/${
    now.getFullYear()}`;
}

export function UtaProvider({ children }) {
  const [utas, setUtas]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(loadHistory);

  const fetchUtas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/uta");
      if (!res.ok) throw new Error("Eroare la fetch");
      const data = await res.json();
      setUtas(data);
      setLoading(false);

      const now   = new Date();
      const today = todayStr();

      // ✅ timestamp: "04/04 14:35"
      const timestamp = `${now.getDate().toString().padStart(2,"0")}/${
        (now.getMonth()+1).toString().padStart(2,"0")} ${
        now.getHours().toString().padStart(2,"0")}:${
        now.getMinutes().toString().padStart(2,"0")}`;

      setHistory(prev => {
        const updated = { ...prev };

        data.forEach(uta => {
          const existing = updated[uta.id] ?? [];

          // ✅ filtrare — păstrează doar punctele din ziua de azi
          const todayPoints = existing.filter(p => {
            const pointDay  = p.date ?? p.time?.substring(0, 5);
            const todayShort = today.substring(0, 5); // "dd/mm"
            return pointDay === todayShort || p.date === today;
          });

          const newPoint = {
            time: timestamp,  // "04/04 14:35" — afișat pe axa X
            date: today,      // "04/04/2026"  — pentru filtrare și tooltip
            Air_inp_Temp:         uta.Air_inp_Temp,
            Air_Output_Temp:      uta.Air_Output_Temp,
            Air_Return_Temp:      uta.Air_Return_Temp,
            Air_outHygro:         uta.Air_outHygro,
            Water_InpChillTemp:   uta.Water_InpChillTemp,
            Water_outChill_Temp:  uta.Water_outChill_Temp,
            Water_InpBoilTemp:    uta.Water_InpBoilTemp,
            Water_OutputBoilTemp: uta.Water_OutputBoilTemp,
            Boil_Pump_Invert:     uta.Boil_Pump_Invert,
            Chiller_Pump_Invert:  uta.Chiller_Pump_Invert,
            Boil_Valve:           uta.Boil_Valve,
            Chiller_Valve:        uta.Chiller_Valve,
            Inp_Damper:           uta.Inp_Damper,
            Output_Damper:        uta.Output_Damper,
            Aspirator:            uta.Aspirator,
            Ventilator:           uta.Ventilator,
            Out_Return_Pressure:  uta.Out_Return_Pressure,
          };

          updated[uta.id] = [...todayPoints.slice(-MAX_POINTS + 1), newPoint];
        });

        saveHistory(updated);
        return updated;
      });

    } catch (err) {
      console.error("Eroare fetch:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtas();
    const interval = setInterval(fetchUtas, 50000);
    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory({});
  };

  return (
    <UtaContext.Provider value={{ utas, setUtas, loading, refresh: fetchUtas, history, clearHistory }}>
      {children}
    </UtaContext.Provider>
  );
}

export const useUta = () => useContext(UtaContext);