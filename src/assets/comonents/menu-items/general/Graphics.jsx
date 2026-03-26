import React from "react";
import "./Graphics.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faHome } from '@fortawesome/free-solid-svg-icons'
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import { GoGraph } from "react-icons/go";

export default function Grahics() {
    return <div className="graphics-button">
          <GoGraph className="menu-icon" />
          <span> Graphics</span>
        </div>
}