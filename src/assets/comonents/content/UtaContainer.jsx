import React from "react";
import Uta from "./Uta";
import UtaDescription from "./UtaDescription";
import "./UtaContainer.css";

export default function UtaContainer({ onUtaClick }) {
  return (
    <div className="uta-container">
      <Uta onClick={onUtaClick} />
      <div className="connector-line" />
      <UtaDescription />
    </div>
  );
}