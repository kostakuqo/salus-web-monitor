import React, { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import "./menu.css";
import Dashboard from "../menu-items/dashboard/Dashboard";
import Settings from "../menu-items/settings/Settings";
import Graphics from "../menu-items/general/Graphics";
import Harta from "../menu-items/harta/Harta";
import Profile from "../menu-items/profile/Profile";
import Home from "../menu-items/home/Home";

export default function Menu({ menuHidden, setMenuHidden, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.split("/")[1] || "";

  const handleNavigate = (path) => {
    navigate(path);
    onNavigate?.();

    // Închide meniul doar pe mobil
    if (window.innerWidth < 768) {
      setMenuHidden(true);
    }
  };

  const getActiveClass = (page) =>
    currentPage === page ? "menu-item active" : "menu-item";

  return (
    <div className={`left-menu ${menuHidden ? "closed" : "open"}`}>
      <div className="menu-content">
        <div className="menu-items">
          <div className={getActiveClass("homepage")} onClick={() => handleNavigate("/homepage")}><Home /></div>
          <div className={getActiveClass("dashboard")} onClick={() => handleNavigate("/dashboard")}><Dashboard /></div>
          <div className={getActiveClass("settings")} onClick={() => handleNavigate("/settings")}><Settings /></div>
          <div className={getActiveClass("graphics")} onClick={() => handleNavigate("/graphics")}><Graphics /></div>
          <div className={getActiveClass("harta")} onClick={() => handleNavigate("/harta")}><Harta /></div>
          <div className={getActiveClass("profile")} onClick={() => handleNavigate("/profile")}><Profile /></div>
        </div>

        <div className="menu-footer">
          <button className="menu-hide-btn" onClick={() => setMenuHidden(true)}>
            <FiArrowLeft /> Hide
          </button>
        </div>
      </div>
    </div>
  );
}