import React from 'react';

const items = [
  { title: 'Morning Meditation', points: 50, completed: true },
  { title: 'Read 20 Pages', points: 75, completed: true },
  { title: 'Exercise 30 Minutes', points: 100, completed: false },
  { title: 'Practice Gratitude', points: 25, completed: false },
];

const ChallengesTab = () => {
  return (
    <div className="container space-6">
      <h3 className="h3">Today's Challenges</h3>

      <div className="space-4">
        {items.map((ch, i) => (
          <div key={i} className="row between align-center">
            <div className="row align-center gap-12">
              <div
                className={`check ${ch.completed ? 'check-on' : 'check-off'}`}
                aria-hidden
              >
                {ch.completed && <div className="check-dot" />}
              </div>
              <span className={`item-title ${ch.completed ? 'on' : 'off'}`}>
                {ch.title}
              </span>
            </div>
            <span className="points">+{ch.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesTab;
