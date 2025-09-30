import './WelcomePage.css';
import { useNavigate } from 'react-router-dom';
import React from "react";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      {/* Background decorative shapes */}
      <div className="bg-shapes">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
        {/* Animated circles - Growth concept */}
        <div className="growth-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
          <div className="circle circle-4"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="welcome-content">
        {/* Logo - DareU in one line with U highlighted */}
        <div className="logo-section">
          <h1 className="logo-text">
            Dare<span className="logo-u">U</span>
          </h1>
        </div>
        
        <p className="tagline">
          Sometimes it's the small decisions<br/>
          that change everything
        </p>
      </div>

      {/* Login button */}
      <div className="button-container">
        <button 
          className="login-button"
          onClick={() => navigate('/login')}
        >
          Start Your Journey
          <span className="button-arrow">→</span>
        </button>
      </div>
    </div>
  );
}