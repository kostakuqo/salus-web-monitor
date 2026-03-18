import React,{useState} from "react";
import "./Harta.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from '@fortawesome/free-solid-svg-icons';



export default function Harta({ onEquipmentClick }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div>
      <div className="menu-item" onClick={() => setShowMap(true)}>
        <FontAwesomeIcon icon={faMap} className="menu-icon" />
        <span>Harta</span>
      </div>

      
    </div>
  );
}