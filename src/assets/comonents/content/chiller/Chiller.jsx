import React from "react";
import "./Chiller.css"

export default function Chiller({ onClick }) {
  return (
    <div className="chiller" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="content-chiller">Chiller
         <div>
          <button className="chiller-details">Shiko Parametrat</button>
        </div>
      </div>
    </div>
  );
}