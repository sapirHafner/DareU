// src/components/BottomNav.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

export default function BottomNav() {
  const location = useLocation();
  
  // הצג רק בדפים שציינת
  const allowedPages = ["/home", "/profile", "/challenges"];
  
  if (!allowedPages.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="bottom fixed">
      <div className="nav">
        {/* Journey - Profile */}
        
        <NavLink
          to="/profile"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon">🐦</div>
          <span className="nav-label">Journey</span>
          <div className="nav-underline" />
        </NavLink>

        
        <NavLink
          to="/challenges"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon">🎯</div>
          <span className="nav-label">Challenges</span>
          <div className="nav-underline" />
        </NavLink>

        {/* Talk to me */}
        <NavLink
          to="/chat"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon">💬</div>
          <span className="nav-label">Talk to me</span>
          <div className="nav-underline" />
        </NavLink>
      </div>
    </div>
  );
}