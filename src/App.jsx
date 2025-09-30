// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";   // 👈 חדש
import Login from "./pages/Login";               // 👈 חדש

import ChatPage from "./pages/ChatPage.jsx";
import BottomNav from "./components/BottomNav";
import Challenges from "./pages/Challenges";
import HomePage from "./pages/HomePage.jsx";
import MinimalProfilePage from "./pages/MinimalProfilePage";
import Survey from "./pages/Survey";
import Topics from "./pages/Topics";

function ProgressStub() {
  return <div style={{ padding: 24 }}>Progress page</div>;
}

// עטיפה שמחליטה מתי להציג את ה-Nav
function Layout({ children }) {
  const location = useLocation();
  // הסתרה במסכים הראשוניים (לנדינג/לוגין/סקר)
  const hideNavOn = ["/", "/login", "/survey"];   // 👈 עודכן

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
          {/* דף ראשון של האפליקציה */}
          <Route path="/" element={<WelcomePage />} />     {/* 👈 חדש */}

          {/* התחברות */}
          <Route path="/login" element={<Login />} />      {/* 👈 חדש */}

          {/* שאלון ואחריו שאר הדפים */}
          <Route path="/survey" element={<Survey />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<MinimalProfilePage />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressStub />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* נתיב לא קיים → חזרה לדף הפתיחה */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
