// src/pages/MinimalProfilePage.jsx
import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import Goals from '../components/Goals';
import './profile.css';

const MinimalProfilePage = () => {
  const [userLevel] = useState(7);
  const [userScore] = useState(2840);
  const [streak] = useState(12);

  const getAnimalStage = (level) => {
    if (level <= 3) return { animal: '🐣', stage: 'Starting Out' };
    if (level <= 6) return { animal: '🐤', stage: 'Growing' };
    if (level <= 10) return { animal: '🐦', stage: 'Progressing' };
    if (level <= 15) return { animal: '🦅', stage: 'Soaring' };
    return { animal: '🦋', stage: 'Transformed' };
  };

  const currentAnimal = getAnimalStage(userLevel);

  return (
    <div className="page profile-page">
      <StatusBar />

      {/* Header */}
      <div className="container pt-8 pb-6">
        <div className="row between align-start mb-8">
          <h1 className="title">Your Journey</h1>
          <div className="pill pill-gray">חיצוני</div>
        </div>
      </div>

      {/* Animal + Level */}
      <div className="container mb-8">
        <div className="center mb-6">
          <div className="animal">{currentAnimal.animal}</div>
          <h2 className="subtitle">Level {userLevel}</h2>
          <p className="muted">{currentAnimal.stage}</p>
        </div>

        <div className="row center gap-32 mb-8">
          <div className="stat">
            <div className="stat-value">{streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat">
            <div className="stat-value">{userScore}</div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>
      </div>

      {/* Goals – מחליף את הטאבים הישנים */}
      <div className="container">
        <Goals />
      </div>
    </div>
  );
};

export default MinimalProfilePage;
