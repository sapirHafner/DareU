// src/App.js
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import ChatPage from "./ChatPage.jsx"; // ← שימי לב לנתיב
import BottomNav from "./components/BottomNav"; // ← שימי לב לנתיב
import Challenges from "./pages/Challenges";
import HomePage from "./pages/HomePage.jsx";
import MinimalProfilePage from "./pages/MinimalProfilePage";
import Survey from "./pages/Survey";
import Topics from "./pages/Topics";

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
           <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>

        {/* סרגל תחתון גלובלי – מופיע בכל הדפים */}
        <BottomNav />
      </div>
    </Router>
  );
}
