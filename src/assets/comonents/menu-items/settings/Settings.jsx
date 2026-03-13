import React from "react";
import "./Settings.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faHome } from '@fortawesome/free-solid-svg-icons'

export default function Settings() {
    return <div className="menu-item">
        <FontAwesomeIcon icon={faGear} className="menu-icon" />
        <span>Settings</span>
    </div>
}