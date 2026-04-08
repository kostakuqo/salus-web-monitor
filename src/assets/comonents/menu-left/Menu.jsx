import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import "./menu.css";
import Dashboard from "../menu-items/dashboard/Dashboard";
import Settings   from "../menu-items/settings/Settings";
import Graphics   from "../menu-items/general/Graphics";
import Harta      from "../menu-items/harta/Harta";
import Profile    from "../menu-items/profile/Profile";
import Home       from "../menu-items/home/Home";
import { useAuth } from "../../../services/AuthProvider"; // ← ajustează calea

export default function Menu({ menuHidden, setMenuHidden, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, username } = useAuth();

  const currentPage = location.pathname.split("/")[1] || "";

  const handleNavigate = (path) => {
    navigate(path);
    onNavigate?.();
    if (window.innerWidth < 768) setMenuHidden(true);
  };

  const getActiveClass = (page) =>
    currentPage === page ? "menu-item active" : "menu-item";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`left-menu ${menuHidden ? "closed" : "open"}`}>
      <div className="menu-content">

        {/* user info sus */}
        <div className="menu-user">
          <div className="menu-user-avatar">
            {username?.charAt(0).toUpperCase()}
          </div>
          <div className="menu-user-name">{username}</div>
        </div>

        <div className="menu-items">
          <div className={getActiveClass("homepage")} onClick={() => handleNavigate("/homepage")}><Home /></div>
          <div className={getActiveClass("dashboard")} onClick={() => handleNavigate("/dashboard")}><Dashboard /></div>
          <div className={getActiveClass("settings")}  onClick={() => handleNavigate("/settings")}><Settings /></div>
          <div className={getActiveClass("graphics")}  onClick={() => handleNavigate("/graphics")}><Graphics /></div>
          <div className={getActiveClass("harta")}     onClick={() => handleNavigate("/harta")}><Harta /></div>
          <div className={getActiveClass("profile")}   onClick={() => handleNavigate("/profile")}><Profile /></div>
        </div>

        <div className="menu-footer">
          {/* buton logout */}
          <button className="menu-logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>

          <button className="menu-hide-btn" onClick={() => setMenuHidden(true)}>
            <FiArrowLeft /> Hide
          </button>
        </div>
      </div>
    </div>
  );
}