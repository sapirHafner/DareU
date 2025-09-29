// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css"; 

import ChatPage from "./ChatPage.jsx";
import BottomNav from "./components/BottomNav";
import Challenges from "./pages/Challenges.jsx";
import HomePage from "./pages/HomePage.jsx";
import MinimalProfilePage from "./pages/MinimalProfilePage.jsx";
import Survey from "./pages/Survey.jsx";
import Topics from "./pages/Topics.jsx";

function ProgressStub() {
  return <div style={{ padding: 24 }}>Progress page</div>;
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* ברירת מחדל → פרופיל */}
          <Route path="/" element={<Navigate to="/profile" replace />} />

          {/* דפים */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<MinimalProfilePage />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressStub />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* נפילה לנתיב קיים */}
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>

        {/* סרגל תחתון גלובלי */}
        <BottomNav />
      </div>
    </Router>
  );
}
