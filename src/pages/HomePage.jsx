import { useNavigate } from "react-router-dom";
import React from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const payload = JSON.parse(localStorage.getItem("generatedQuestions") || "{}");
  console.log(payload);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome</h1>
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
