import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import "./KaldajaInterface.css"

export default function KaldajaInterface({ onBack }) {
    return (
        <div className="kaldaja-interface">
            <h2>Kaldaja Interface</h2>
            <p>Ketu do te vendosen te gjitha detajet dhe funksionet e kaldajes.</p>
            <button className="back-button" onClick={onBack}>
                <span className="back-icon"><FiArrowLeft /></span>
                Back
            </button>

        </div>
    );
}