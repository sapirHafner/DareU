import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import ChallengesTab from './tabs/ChallengesTab';
import InfoTab from './tabs/InfoTab';
import ProgressTab from './tabs/ProgressTab';
import './profile.css';

const MinimalProfilePage = () => {
  const [userLevel, setUserLevel] = useState(7);
  const [userScore, setUserScore] = useState(2840);
  const [streak, setStreak] = useState(12);
  const [activeTab, setActiveTab] = useState('challenges');

  // 0–100%
  const levelProgress = ((userScore % 500) / 500) * 100;

  const getAnimalStage = (level) => {
    if (level <= 3) return { animal: '🐣', stage: 'Starting Out' };
    if (level <= 6) return { animal: '🐤', stage: 'Growing' };
    if (level <= 10) return { animal: '🐦', stage: 'Progressing' };
    if (level <= 15) return { animal: '🦅', stage: 'Soaring' };
    return { animal: '🦋', stage: 'Transformed' };
  };

  const currentAnimal = getAnimalStage(userLevel);

  const renderTab = () => {
    if (activeTab === 'challenges') {
      return <ChallengesTab />;
    }
    if (activeTab === 'info') {
      return (
        <InfoTab
          userScore={userScore}
          streak={streak}
          userLevel={userLevel}
          stage={currentAnimal.stage}
        />
      );
    }
    if (activeTab === 'progress') {
      return (
        <ProgressTab
          userLevel={userLevel}
          levelProgress={levelProgress}
          userScore={userScore}
        />
      );
    }
    return null;
  };

  return (
    <div className="page">
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

      {/* Tabs */}
      <div className="container mb-6">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            Challenges
          </button>
          <button
            className={`tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Information
          </button>
          <button
            className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
        </div>
        <div className="divider" />
      </div>

      <div className="tab-content">
        {renderTab()}
      </div>

      <BottomNav active="journey" />
    </div>
  );
};

export default MinimalProfilePage;
