import React from "react";
import "./General.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faHome } from '@fortawesome/free-solid-svg-icons'
import { faSliders } from "@fortawesome/free-solid-svg-icons";

export default function General() {
    return <div className="menu-item">
          <FontAwesomeIcon icon={faSliders} className="menu-icon" />
          <span>General</span>
        </div>
}