import React from 'react';

const StatusBar = () => {
  return (
    <div className="status">
      <span>9:41</span>
      <div className="status-right">
        <div className="dots">
          <div className="dot on" />
          <div className="dot on" />
          <div className="dot on" />
          <div className="dot off" />
        </div>
        <div className="battery">
          <div className="battery-fill" />
        </div>
        <div className="signal" />
      </div>
    </div>
  );
};

export default StatusBar;
