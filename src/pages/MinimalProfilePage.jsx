// src/pages/MinimalProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [{ points, level }, setMeta] = useState(() => readMeta());

  // בדיקה אם השאלון הושלם
  useEffect(() => {
    if (!window.surveyAnswers) {
      navigate('/survey');
      return;
    }
  }, [navigate]);

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

  // אם אין נתוני סקר, אל תרנדר כלום (הניווט כבר יקרה)
  if (!window.surveyAnswers) {
    return null;
  }

  return (
    <div className="page profile-page">
      {/* Header - רק Your Journey */}
      <div className="container pt-8 pb-6">
        <h1 className="title">Your Journey</h1>
      </div>

      {/* Animal + Level */}
      <div className="container mb-8">
        <div className="center mb-6">
          <div className="animal">{currentAnimal.animal}</div>
          <h2 className="subtitle">Level {level}</h2>
          <p className="muted">{currentAnimal.stage}</p>
        </div>

        {/* Total Points */}
        <div className="row center gap-32 mb-8">
          <div className="stat">
            <div className="stat-value">{points}</div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="container">
        <Goals />
      </div>
    </div>
  );
};

export default MinimalProfilePage;