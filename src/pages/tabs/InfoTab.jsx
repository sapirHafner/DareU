import React from 'react';

const Row = ({ label, value }) => (
  <div className="row between">
    <span className="info-label">{label}</span>
    <span className="info-value">{value}</span>
  </div>
);

const InfoTab = ({ userScore, streak, userLevel, stage }) => {
  return (
    <div className="container space-8">
      <h3 className="h3">Your Information</h3>

      <div className="space-6">
        <Row label="Total Points" value={userScore} />
        <Row label="Current Streak" value={`${streak} days`} />
        <Row label="Current Level" value={`Level ${userLevel}`} />
        <Row label="Stage" value={stage} />
      </div>

      <div className="space-3">
        <h4 className="h4">Recent Achievements</h4>
        <div className="space-3">
          <div className="row align-center gap-12">
            <span className="emoji">🔥</span>
            <span className="achv">7-Day Streak Master</span>
          </div>
          <div className="row align-center gap-12">
            <span className="emoji">⭐</span>
            <span className="achv">Level 5 Reached</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoTab;
