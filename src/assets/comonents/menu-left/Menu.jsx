import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FiMenu } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import "./menu.css";
import Dashboard from "../menu-items/dashboard/Dashboard";
import Settings from "../menu-items/settings/Settings";
import General from "../menu-items/general/General";
import Harta from "../menu-items/harta/Harta";
import Profile from "../menu-items/profile/Profile";
import Home from "../menu-items/home/Home";

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.split("/")[1] || "";
  const [isOpen, setIsOpen] = React.useState(false);
  const [menuHidden, setMenuHidden] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    if (path === "/harta") {
      setMenuHidden(true);
    }
  };

  // Când navighezi în altă parte (ex. browser back), meniul reapare automat
  useEffect(() => {
    if (currentPage !== "harta") {
      setMenuHidden(false);
    }
  }, [currentPage]);

  const getActiveClass = (page) =>
    currentPage === page ? "menu-item active" : "menu-item";

  return (
    <>
      {/* Buton normal toggle — ascuns când meniul e hidden */}
      {!menuHidden && (
        <button className="menu-toggle" onClick={toggleMenu}>
          <FiMenu size={28} />
        </button>
      )}

      {/* Buton "Vezi Meniu" — apare doar pe pagina Harta */}
      {menuHidden && (
        <button
          className="menu-toggle menu-show-btn"
          onClick={() => setMenuHidden(false)}
        >
          <FiMenu size={20} />
          <span className="menu-show-label"></span>
        </button>
      )}

      {/* Meniul complet — nu se randează deloc când e hidden */}
      {!menuHidden && (
        <div className={`left-menu ${isOpen ? "open" : "closed"}`}>
          <div className={getActiveClass("homepage")} onClick={() => handleNavigate("/homepage")}>
            <Home />
          </div>
          <div className={getActiveClass("dashboard")} onClick={() => handleNavigate("/dashboard")}>
            <Dashboard />
          </div>
          <div className={getActiveClass("settings")} onClick={() => handleNavigate("/settings")}>
            <Settings />
          </div>
          <div className={getActiveClass("general")} onClick={() => handleNavigate("/general")}>
            <General />
          </div>
          <div className={getActiveClass("harta")} onClick={() => handleNavigate("/harta")}>
            <Harta />
          </div>
          <div className={getActiveClass("profile")} onClick={() => handleNavigate("/profile")}>
            <Profile />
          </div>
          <button className="back-button-mobile" onClick={toggleMenu}>
            <FiArrowLeft /> Back
          </button>

          {/* Buton "Ascunde" — vizibil doar pe pagina Harta */}
          {currentPage === "harta" && (
            <button
              className="menu-hide-btn"
              onClick={() => {
                setMenuHidden(true);
                setIsOpen(false);
              }}
            >
              <FiArrowLeft size={14} />
              <span>Hide</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}