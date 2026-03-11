import React from "react";
 import "./menu.css"
 import Dashboard from "../menu-items/dashboard/Dashboard";
 import Settings from"../menu-items/settings/Settings";

 export default function Menu(){
     return(
    <div className="left-menu">
      <Dashboard/>
      <Settings/>
     
    </div>
  )
  

 }