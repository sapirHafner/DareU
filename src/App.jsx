import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import ChatPage from "./ChatPage.jsx"; 
import Challenges from "./pages/Challenges";
import HomePage from "./pages/HomePage.jsx";
import Survey from "./pages/Survey.jsx";
import Topics from "./pages/Topics.jsx";
import Challenges from "./pages/Challenges.jsx";
import BottomNav from "./components/BottomNav.jsx"; 
import MinimalProfilePage from "./pages/MinimalProfilePage";

function ProgressStub() {
  return <div style={{ padding: 24 }}>Progress page</div>;
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<MinimalProfilePage />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressStub />} />
          <Route path="/topics" element={<Topics />} />
           <Route path="/chat" element={<ChatPage />} />
        </Routes>

        {/* הבר יופיע תמיד עכשיו */}
        <BottomNav />
      </div>
    </Router>
  );
}