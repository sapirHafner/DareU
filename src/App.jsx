// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

import BottomNav from "./components/BottomNav.jsx";

import HomePage from "./pages/HomePage.jsx";
import MinimalProfilePage from "./pages/MinimalProfilePage.jsx";
import Survey from "./pages/Survey.jsx";
import Topics from "./pages/Topics.jsx";
import Challenges from "./pages/Challenges.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import Login from "./pages/Login.jsx";

function ProgressStub() {
  return <div style={{ padding: 24 }}>Progress page</div>;
}

// עטיפה שמחליטה מתי להציג את ה-Nav
function Layout({ children }) {
  const location = useLocation();
  // הסתרה במסכים הראשוניים (לנדינג/לוגין/סקר)
  const hideNavOn = ["/", "/login", "/survey"];

  return (
    <div className="app">
      {children}
      {!hideNavOn.includes(location.pathname) && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* דף פתיחה והתחברות */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />

          {/* שאר הדפים */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<MinimalProfilePage />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressStub />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* נתיב לא קיים → חזרה לדף הפתיחה */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
