import React from "react";
import "./Profile.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default function Profile() {
    return <div className="menu-item">
        <FontAwesomeIcon icon={faUser} className="menu-icon" />
        <span>Profile</span>
    </div>
}