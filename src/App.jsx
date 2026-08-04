import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import "./App.css";

import BottomNav from "./components/BottomNav.jsx";

import Challenges from "./pages/Challenges.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import MinimalProfilePage from "./pages/MinimalProfilePage.jsx";
import Survey from "./pages/Survey.jsx";
import Topics from "./pages/Topics.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";

function ProgressStub() {
  return <div style={{ padding: 24 }}>Progress page</div>;
}

// Wrapper that decides when the navigation bar should be shown
function Layout({ children }) {
  const location = useLocation();
  // Hide navigation on landing, login, and survey screens
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
          {/* Landing and login routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />

          {/* Other app pages */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<MinimalProfilePage />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressStub />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* Unknown route → redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
