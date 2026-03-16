import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FiEye } from "react-icons/fi";
import "./Chiller.css"

export default function Chiller({ onClick }) {
  return (
    <div className="chiller" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="content-chiller">Chiller
         <div>
          <button className="chiller-details"><FiEye style={{ marginRight: "5px",paddingTop:"2px" }} />Shiko Parametrat</button>
        </div>
      </div>
    </div>
  );
}