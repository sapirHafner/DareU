import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const payload = window.generatedQuestions || {};
  const surveyData = window.surveyAnswers || null;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome</h1>
      
      {surveyData && (
        <div style={{ marginBottom: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
          <h2>Your Survey Results:</h2>
          <p><strong>Topics:</strong> {surveyData.selectedTopics?.join(", ")}</p>
          <p><strong>Primary Motivation:</strong> {surveyData.primaryMotivation}</p>
          <p><strong>Generated Questions:</strong> {payload.questions?.length || 0}</p>
        </div>
      )}

      <button
        onClick={() => navigate("/profile")}
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "none",
          background: "#333",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Go to Profile
      </button>
    </div>
  );
}