import React from "react";
import "./Dashboard.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faHome } from '@fortawesome/free-solid-svg-icons'

export default function Dashboard(){
    return  <div className="menu-item"><FontAwesomeIcon icon={faHome} style={{ marginRight: '8px' }} /> Dashboard</div>;
}