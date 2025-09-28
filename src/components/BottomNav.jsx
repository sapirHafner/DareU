// src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

export default function BottomNav() {
  return (
    <div className="bottom fixed">
      <div className="nav">
        
        <NavLink
          to="/profile"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon" style={{ fontSize: "28px" }}>🐦</div>
          <span className="nav-label">Journey</span>
          <div className="nav-underline" />
        </NavLink>

        
        <NavLink
          to="/challenges"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon" style={{ fontSize: "28px" }}>🎯</div>
          <span className="nav-label">Challenges</span>
          <div className="nav-underline" />
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon" style={{ fontSize: "28px" }}>💬</div>
          <span className="nav-label">Talk to me !!</span>
          <div className="nav-underline" />
        </NavLink>
      </div>
    </div>
  );
}
