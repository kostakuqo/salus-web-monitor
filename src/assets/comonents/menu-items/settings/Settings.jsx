import React, { use } from "react";
import "./Settings.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faHome } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router";

export default function Settings({ onOpenSettings }) {
  return (
    <div
      className="settings-button"
      onClick={() => {
        if (onOpenSettings) {
          onOpenSettings();
        } 
      }}
    >
      <FontAwesomeIcon icon={faGear} className="menu-icon" />
      <span>Settings</span>
    </div>
  );
}