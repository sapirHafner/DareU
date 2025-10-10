// src/pages/Login.jsx
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.agreed) {
      alert("You must accept the Terms to continue.");
      return;
    }
    if (!formData.firstName || !formData.email) {
      alert("Please fill in first name and email.");
      return;
    }

    localStorage.setItem("userData", JSON.stringify(formData));
    navigate("/survey", { replace: true });
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Sign in to DareU</h2>

      <div className="google-login">
        <GoogleLogin
          onSuccess={(res) => {
            if (!formData.agreed) {
              alert("You must accept the Terms to continue.");
              return;
            }
            try {
              // You can decode email/name if needed:
              // const payload = JSON.parse(atob(res.credential.split(".")[1]));
              localStorage.setItem("googleToken", res.credential || "");
              navigate("/survey", { replace: true });
            } catch {
              alert("There was an error processing the sign-in.");
            }
          }}
          onError={() => alert("Google sign-in failed. Please try again.")}
        />
      </div>

      <div className="or-separator">OR</div>

      <form className="manual-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          value={formData.firstName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          value={formData.lastName}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <label className="checkbox-container">
          <input
            type="checkbox"
            name="agreed"
            checked={formData.agreed}
            onChange={handleChange}
          />
          I confirm that I’ve read and accept the Terms
        </label>

        <button type="submit" className="submit-btn">
          Sign up
        </button>
      </form>
    </div>
  );
}
