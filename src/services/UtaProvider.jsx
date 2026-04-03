import { createContext, useContext, useState, useEffect } from "react";

const UtaContext = createContext();

const STORAGE_KEY = "uta_history";
const MAX_POINTS = 500; // câte puncte păstrezi total

// ← încarcă istoricul din localStorage la start
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ← salvează istoricul în localStorage
function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    console.warn("localStorage plin sau indisponibil");
  }
}

export function UtaProvider({ children }) {
  const [utas, setUtas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(loadHistory); // ← încarcă la start

  const fetchUtas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/uta");
      if (!res.ok) throw new Error("Eroare la fetch");
      const data = await res.json();
      setUtas(data);
      setLoading(false);

      const timestamp = new Date().toLocaleTimeString();
      setHistory(prev => {
        const updated = { ...prev };
        data.forEach(uta => {
          const existing = updated[uta.id] ?? [];
          const newPoint = {
            time: timestamp,
            Air_inp_Temp: uta.Air_inp_Temp,
            Air_Output_Temp: uta.Air_Output_Temp,
            Air_Return_Temp: uta.Air_Return_Temp,
            Air_outHygro: uta.Air_outHygro,
            Water_InpChillTemp: uta.Water_InpChillTemp,
            Water_outChill_Temp: uta.Water_outChill_Temp,
            Water_InpBoilTemp: uta.Water_InpBoilTemp,
            Water_OutputBoilTemp: uta.Water_OutputBoilTemp,
            Boil_Pump_Invert: uta.Boil_Pump_Invert,
            Chiller_Pump_Invert: uta.Chiller_Pump_Invert,
            Boil_Valve: uta.Boil_Valve,
            Chiller_Valve: uta.Chiller_Valve,
            Inp_Damper: uta.Inp_Damper,
            Output_Damper: uta.Output_Damper,
            Aspirator: uta.Aspirator,
            Ventilator: uta.Ventilator,
            Out_Return_Pressure: uta.Out_Return_Pressure,
          };
          updated[uta.id] = [...existing.slice(-MAX_POINTS + 1), newPoint];
        });

        saveHistory(updated); // ← salvează după fiecare fetch
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

  // ← funcție pentru a șterge istoricul dacă vrei
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