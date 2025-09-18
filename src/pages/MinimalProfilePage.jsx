// src/pages/MinimalProfilePage.jsx
import React, { useEffect, useState } from 'react';
import StatusBar from '../components/StatusBar';
import Goals from '../components/Goals';
import './profile.css';

const META_KEY = "dareu_meta";

function readMeta() {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY) || "{}");
    return {
      points: Number(m.points ?? 0),
      level: Number(m.level ?? 1),
    };
  } catch {
    return { points: 0, level: 1 };
  }
}

const MinimalProfilePage = () => {
  const [{ points, level }, setMeta] = useState(() => readMeta());

  useEffect(() => {
    // טען נקודות/Level בעת כניסה
    setMeta(readMeta());

    // האזנה לעדכון חי שמגיע מעמוד Challenges (אחרי Success)
    const handler = () => setMeta(readMeta());
    window.addEventListener("dareu:progress-update", handler);
    return () => window.removeEventListener("dareu:progress-update", handler);
  }, []);

  const getAnimalStage = (lvl) => {
    if (lvl <= 2) return { animal: '🐣', stage: 'Starting Out' };
    if (lvl <= 4) return { animal: '🐤', stage: 'Growing' };
    if (lvl <= 6) return { animal: '🐦', stage: 'Progressing' };
    if (lvl <= 10) return { animal: '🦅', stage: 'Soaring' };
    return { animal: '🦋', stage: 'Transformed' };
  };

  const currentAnimal = getAnimalStage(level);

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
          <h2 className="subtitle">Level {level}</h2>
          <p className="muted">{currentAnimal.stage}</p>
        </div>

        {/* הוספנו כאן רק Total Points, הסרנו Day Streak */}
        <div className="row center gap-32 mb-8">
          <div className="stat">
            <div className="stat-value">{points}</div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>
      </div>

      {/* Goals – יציג עיגולים ירוקים על בסיס dareu_progress, ולא מתאפס אוטומטית */}
      <div className="container">
        <Goals />
      </div>
    </div>
  );
};

export default MinimalProfilePage;
