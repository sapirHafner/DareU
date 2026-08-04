import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Goals from '../components/Goals';
import './styles/profile.css';

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

  // Check whether the survey has been completed
  useEffect(() => {
    if (!window.surveyAnswers) {
      navigate('/survey');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Load points and level on entry
    setMeta(readMeta());

    // Listen for live updates from the Challenges page
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

  // If survey data is missing, don't render yet (navigation will occur)
  if (!window.surveyAnswers) {
    return null;
  }

  return (
    <div className="page profile-page">
      {/* Header - only Your Journey */}
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