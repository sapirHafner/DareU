// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Survey from "./pages/Survey";
import Topics from "./pages/Topics";
import MinimalProfilePage from "./pages/MinimalProfilePage"; // הפרופיל שיצרת
import HomePage from "./pages/HomePage.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/profile" element={<MinimalProfilePage />} />
      </Routes>
    </Router>
  );
}
