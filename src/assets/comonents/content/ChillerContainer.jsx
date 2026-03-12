import React from "react";
import Chiller from "./Chiller";
import ChillerDescription from "./ChillerDescription";
import "./Chiller.css";
import "./ChillerContainer.css"

export default function ChillerContainer() {
    return (
        <div className="chiller-container">
            <Chiller />
            <div className="connector-line" />
            <ChillerDescription/>
        </div>
    );
}