// src/components/BottomNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function BottomNav() {
  return (
    <div className="bottom fixed">
      <div className="nav">
        <NavLink
          to="/profile"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon filled"><div className="nav-tick" /></div>
          <span className="nav-label">Journey</span>
          <div className="nav-underline" />
        </NavLink>

        <NavLink
          to="/challenges"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <MessageCircle className="mx-auto mb-1" size={24} />
          <span className="nav-label">Challenges</span>
          <div className="nav-underline" />
        </NavLink>

        <NavLink
          to="/progress"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon box" />
          <span className="nav-label">Progress</span>
          <div className="nav-underline" />
        </NavLink>
      </div>
    </div>
  );
}
