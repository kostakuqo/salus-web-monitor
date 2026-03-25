import React, { useState } from "react";
import { initialUtaData } from "../../content/uta/uta data/utaData";
import TemperatureChart from "../../content/uta/TemperatureChart";
import "./GraphicPage.css"
 
export default function GraphicsPage() {
  const [showChart, setShowChart] = useState(true);

  return (
    <div className="graphics-page">

      {/* Buton redeschidere (opțional) */}
      {!showChart && (
        <button
          onClick={() => setShowChart(true)}
          className="open-chart-btn"
        >
          Graphics
        </button>
      )}

      {/* Container grafic */}
      {showChart && (
        <div className="chart-container">
          <TemperatureChart
            utaData={initialUtaData}
            selectedUta={initialUtaData[0]}
            onClose={() => setShowChart(false)}
          />
        </div>
      )}
    </div>
  );
}