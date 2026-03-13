import React from "react";
import "./Harta.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from '@fortawesome/free-solid-svg-icons';

export default function Harta() {
  return (
    <div className="menu-item">
      <FontAwesomeIcon icon={faMap} className="menu-icon" />
      <span>Harta</span>
    </div>
  );
}