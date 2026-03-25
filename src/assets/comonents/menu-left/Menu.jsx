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

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.split("/")[1] || "";
  const [isOpen, setIsOpen] = useState(false);
  const [menuHidden, setMenuHidden] = useState(false);

  const toggleMenu = () => setIsOpen(prev => !prev);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    if (path === "/harta") setMenuHidden(true);
  };

  useEffect(() => {
    if (currentPage !== "harta") setMenuHidden(false);
  }, [currentPage]);

  const getActiveClass = (page) =>
    currentPage === page ? "menu-item active" : "menu-item";

  const menuClass = () => {
    if (menuHidden) return "left-menu hidden";
    return `left-menu ${isOpen ? "open" : "closed"}`;
  };

  return (
    <>
      <button
        className={`menu-toggle ${menuHidden ? "visible-on-desktop" : ""}`}
        onClick={() => {
          if (menuHidden) {
            setMenuHidden(false);
            setIsOpen(true);
          } else toggleMenu();
        }}
      >
        <FiMenu size={28} />
      </button>

      <div className={menuClass()}>
        <div className={getActiveClass("homepage")} onClick={() => handleNavigate("/homepage")}>
          <Home />
        </div>
        <div className={getActiveClass("dashboard")} onClick={() => handleNavigate("/dashboard")}>
          <Dashboard />
        </div>
        <div className={getActiveClass("settings")} onClick={() => handleNavigate("/settings")}>
          <Settings />
        </div>
        <div className={getActiveClass("graphics")} onClick={() => handleNavigate("/graphics")}>
          <Graphics />
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

        {currentPage === "harta" && (
          <button
            className="menu-hide-btn"
            onClick={() => {
              setMenuHidden(true);
              setIsOpen(false);
            }}
          >
            <FiArrowLeft size={14} /> <span>Hide</span>
          </button>
        )}
      </div>
    </>
  );
}