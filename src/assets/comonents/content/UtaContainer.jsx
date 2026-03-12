// UtaContainer.js
import React from "react";
import Uta from "./Uta";
import UtaDescription from "./UtaDescription";
import "./Uta.css";
import "./UtaContainer.css"

export default function UtaContainer() {
    return (
        <div className="uta-container">
            <Uta />
            <div className="connector-line" />
            <UtaDescription/>
        </div>
    );
}