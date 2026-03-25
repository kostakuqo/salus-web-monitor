import React, { useState } from "react";
import { initialUtaData } from "../../content/uta/uta data/utaData";
import UtaChartEmbed from "../../content/uta/TemperatureChart";
import "./GraphicPage.css"
 
export default function GraphicsPage() {
  const [showChart, setShowChart] = useState(true); // 🔥 control vizibilitate

  return (
    <div
      className="graphics-page"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >

      {/* Buton redeschidere (opțional) */}
      {!showChart && (
        <button
          onClick={() => setShowChart(true)}
          style={{
            margin: "10px",
            padding: "8px 12px",
            width:"97%",
            height:"400px",
            background: "linear-gradient(135deg, #1A355E, #3E5AA8)",
            color: "#fff",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Graphics
        </button>
      )}

      {/* Container grafic */}
      {showChart && (
        <div
          style={{
            flex: 1,
            background: "#0f1420",
            padding: "16px",
            border: "1px solid #1e293b",
            minHeight: 0,
          }}
        >
          <UtaChartEmbed
            utaData={initialUtaData}
            selectedUta={initialUtaData[0]}
            onClose={() => setShowChart(false)} // 🔥 AICI E TOT
          />
        </div>
      )}
    </div>
  );
}