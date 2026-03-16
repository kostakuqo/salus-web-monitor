import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons"; // 🔹 iconul Home
import './Home.css'; // optional, pentru stiluri
import HomePage from './Homepage';

export default function Home() {
    const navigate = useNavigate();


    return (
        <div
            className="menu-item"
            onClick={() => navigate("/home")}
        >
            <FontAwesomeIcon icon={faHome} className="menu-icon" />
            <span>Home</span>
        </div>
    );
}
