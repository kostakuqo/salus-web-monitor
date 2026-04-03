import React, { useState } from "react";
import TemperatureChart from "../../content/uta/TemperatureChart";
import "./GraphicPage.css";
import { GoGraph } from "react-icons/go";
import { useUta } from "../../../../services/UtaProvider";

export default function GraphicsPage() {
  const { utas, history } = useUta(); // ← adaugă history
  const [showChart, setShowChart] = useState(true);
  const [selectedUta, setSelectedUta] = useState(utas?.[0] ?? null);

  React.useEffect(() => {
    if (!selectedUta && utas.length > 0) {
      setSelectedUta(utas[0]);
    }
  }, [utas, selectedUta]);

  // istoricul pentru UTA selectată
  const selectedHistory = history[selectedUta?.id] ?? [];

  return (
    <div className="graphics-page">
      {!showChart && (
        <button onClick={() => setShowChart(true)} className="open-chart-btn">
          <GoGraph className="menu-icon" />
          <span> Graphics</span>
        </button>
      )}

      {showChart && selectedUta && (
        <div className="chart-container">
          <TemperatureChart
            utaData={utas}
            selectedUta={selectedUta}
            historyData={selectedHistory} // ← linia de date
            onClose={() => setShowChart(false)}
          />
        </div>
      )}
    </div>
  );
}