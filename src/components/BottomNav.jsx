// src/components/BottomNav.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./BottomNav.css";
import React from "react";

export default function BottomNav() {
  const location = useLocation();

  // מציגים את הניווט רק בעמודים הרלוונטיים
  const allowedPages = ["/home", "/profile", "/minimalprofile", "/challenges", "/chat"];
  if (!allowedPages.includes(location.pathname)) {
    return null;
  }

  return (
    // open קבוע – אין מצב סגור ואין כפתור חץ
    <div className="bottom fixed open">
      <div className="nav">
        {/* Home */}
        <NavLink
          to="/home"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon">🏠</div>
          <span className="nav-label">Home</span>
          <div className="nav-underline" />
        </NavLink>

        {/* Journey (MinimalProfile) 
            אם הראוט שלך הוא /profile שמוביל ל-MinimalProfilePage (כמו שהראית),
            השאירי /profile. אם שינית לנתיב /minimalprofile — החליפי את ה-to למטה. */}
        <NavLink
          to="/profile" // אם שינית את הראוט ל־/minimalprofile, החליפי כאן ל־"/minimalprofile"
          className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")}
        >
          <div className="nav-icon">🐦</div>
          <span className="nav-label">Journey</span>
          <div className="nav-underline" />
        </NavLink>

        {/* Challenges */}
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
