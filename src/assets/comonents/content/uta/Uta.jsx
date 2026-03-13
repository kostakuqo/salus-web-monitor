import React from "react";
import "./Uta.css";

export default function Uta({ onClick }) {
  return (
    <div className="uta" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="content-uta">UTA
        <div>
          <button className="uta-details">Shiko Parametrat</button>
        </div>
        
      </div>
    </div>
  );
}