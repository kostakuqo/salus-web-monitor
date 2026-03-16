import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FiEye } from "react-icons/fi";
import "./Kaldaja.css";

export default function Kaldaja({ onClick }) {
  return (
    <div className="kaldaja" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="content-kaldaja">Kaldaja
        <button className="kaldaja-details"><FiEye style={{ marginRight: "5px",paddingTop:"2px" }} />Shiko Parametrat</button>
      </div>
    </div>
  );
}