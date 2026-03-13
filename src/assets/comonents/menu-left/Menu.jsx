import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import "./menu.css";
import Dashboard from "../menu-items/dashboard/Dashboard";
import Settings from "../menu-items/settings/Settings";
import General from "../menu-items/general/General";
import Harta from "../menu-items/harta/Harta";
import Profile from "../menu-items/profile/Profile";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Icon hamburger vizibil doar pe mobile */}
      <button className="menu-toggle" onClick={toggleMenu}>
        <FiMenu size={28} />
      </button>

      <div className={`left-menu ${isOpen ? "open" : "closed"}`}>
        <Dashboard />
        <Settings />
        <General />
        <Harta />
        <Profile />
      </div>
    </>
  );
}