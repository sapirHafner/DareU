import React from 'react';
import { MessageCircle } from 'lucide-react';

const BottomNav = ({ active = 'journey' }) => {
  return (
    <div className="bottom">
      <div className="nav">
        <button className="nav-btn muted">
          <div className="nav-icon ring" />
          <span className="nav-label muted">Master chat bot</span>
        </button>

        <button className={`nav-btn ${active === 'journey' ? 'active' : ''}`}>
          <div className="nav-icon filled">
            <div className="nav-tick" />
          </div>
          <span className="nav-label strong">Journey</span>
          <div className="nav-underline" />
        </button>

        <button className="nav-btn muted">
          <MessageCircle className="mx-auto mb-4" size={24} color="gray" />
          <span className="nav-label muted">Community</span>
        </button>

        <button className="nav-btn muted">
          <div className="nav-icon box" />
          <span className="nav-label muted">Progress</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
