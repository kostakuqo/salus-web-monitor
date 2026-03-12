import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import "./UtaInterface.css"

export default function UtaInterface({ onBack }) {
    return (
        <div className="uta-interface">
            <h2>UTA Interface</h2>
            <p>Ketu do vendosen te gjitha detajet dhe funksionet per UTA.</p>
            <button className="back-button" onClick={onBack}>
                <span className="back-icon"><FiArrowLeft /></span>
                Back
            </button>

        </div>
    );
}