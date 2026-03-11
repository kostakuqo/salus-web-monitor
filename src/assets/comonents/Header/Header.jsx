import React from 'react';
import logo from "../../../../public/logos/salus_logo.png"
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <img src={logo} alt="Logo" className="logo-img" />

        {/* Titlu cu linii */}
        <div className="header-title">
          <span className="line"></span>
          <h1>Salus Web Monitor</h1>
          <span className="line"></span>
        </div>
      </div>
    </header>
  );
}