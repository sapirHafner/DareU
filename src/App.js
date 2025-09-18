// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import Survey from "./pages/Survey";
import Topics from "./pages/Topics";
import MinimalProfilePage from "./pages/MinimalProfilePage";
import Challenges from "./pages/Challenges";
import BottomNav from "./components/BottomNav"; // ← שימי לב לנתיב

// אם אין לך עמוד Progress, אפשר להשאיר את ה-stub למטה
function ProgressStub() {
  return <div style={{ padding: 24 }}>Progress page</div>;
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* ברירת מחדל ל-Journey */}
          <Route path="/" element={<Navigate to="/profile" replace />} />

          {/* דפים קיימים */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<MinimalProfilePage />} />  {/* Journey */}
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/progress" element={<ProgressStub />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/topics" element={<Topics />} />
        </Routes>

        {/* סרגל תחתון גלובלי – מופיע בכל הדפים */}
        <BottomNav />
      </div>
    </Router>
  );
}
