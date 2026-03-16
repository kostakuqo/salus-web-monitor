import React from "react";
import "./Uta.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FiEye } from "react-icons/fi";
export default function Uta({ onClick }) {
  return (
    <div className="uta" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="content-uta">UTA
        <div>
          <button className="uta-details"><FiEye style={{ marginRight: "5px",paddingTop:"2px" }} />Shiko Parametrat</button>
        </div>
        
      </div>
    </div>
  );
}