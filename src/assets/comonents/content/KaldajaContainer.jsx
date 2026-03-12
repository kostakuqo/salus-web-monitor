import React from "react";
import Kaldaja from "./Kaldaja"
import KaldajaDescription from "./KaldajaDescription";
import "./Kaldaja.css";
import "./KaldajaContainer.css";

export default function KaldajaContainer() {
    return (
        <div className="Kaldaja-container">
            <Kaldaja/>
            <div className="connector-line" />
            <KaldajaDescription/>
            
        </div>
    );
}