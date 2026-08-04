import { NavLink, useLocation } from "react-router-dom";
import "./BottomNav.css";

const ALLOWED_PATHS = ["/home", "/profile", "/challenges", "/chat"];

const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: "🏠" },
  { path: "/profile", label: "Journey", icon: "🐦" },
  { path: "/challenges", label: "Challenges", icon: "🎯" },
  { path: "/chat", label: "Talk to me", icon: "💬" },
];

export default function BottomNav() {
  const location = useLocation();

  if (!ALLOWED_PATHS.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="bottom fixed open">
      <nav className="nav" aria-label="Bottom navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-btn${isActive ? " active" : ""}`}
          >
            <div className="nav-icon" aria-hidden="true">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
            <div className="nav-underline" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
