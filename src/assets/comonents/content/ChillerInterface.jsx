import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import "./ChillerInterface.css"

export default function ChillerInterface({ onBack }) {
    return (
        <div className="chiller-interface">
            <h2>Chiller Interface</h2>
            <p>Ketu do te vendosen te gjitha detajet dhe funksionet e chillerit.</p>
            <button className="back-button" onClick={onBack}>
                <span className="back-icon"><FiArrowLeft /></span>
                Back
            </button>

        </div>
    );
}