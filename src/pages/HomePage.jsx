import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

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
