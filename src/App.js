// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ChatPage from "./ChatPage.jsx";
import BottomNav from "./components/BottomNav";
import Challenges from "./pages/Challenges";
import HomePage from "./pages/HomePage.jsx";
import MinimalProfilePage from "./pages/MinimalProfilePage";
import Survey from "./pages/Survey";
import Topics from "./pages/Topics";

function ProgressStub() {
  return <div style={{ padding: 24 }}>Progress page</div>;
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<MinimalProfilePage />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressStub />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>

        <BottomNav />
      </div>
    </Router>
  );
}
