import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import Survey from "./pages/Survey.jsx";
import Topics from "./pages/Topics.jsx";
import MinimalProfilePage from "./pages/MinimalProfilePage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Survey />} />
        <Route path="/profile" element={<MinimalProfilePage />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
