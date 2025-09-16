import React from 'react';

const week = [
  { day: 'M', completed: 3, total: 4 },
  { day: 'T', completed: 4, total: 4 },
  { day: 'W', completed: 2, total: 4 },
  { day: 'T', completed: 4, total: 4 },
  { day: 'F', completed: 3, total: 4 },
  { day: 'S', completed: 1, total: 4 },
  { day: 'S', completed: 2, total: 4 },
];

const ProgressTab = ({ userLevel, levelProgress, userScore }) => {
  return (
    <div className="container space-8">
      <h3 className="h3">Your Progress</h3>

      {/* Level progress */}
      <div>
        <div className="row between align-center mb-8">
          <span className="muted">Progress to Level {userLevel + 1}</span>
          <span className="tiny">{Math.round(levelProgress)}%</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${levelProgress}%` }} />
        </div>
        <p className="tiny mt-8">
          {500 - (userScore % 500)} points to next level
        </p>
      </div>

      {/* Weekly chart */}
      <div>
        <h4 className="h4 mb-16">This Week</h4>
        <div className="row between align-end h-96">
          {week.map((d, i) => (
            <div key={i} className="col center gap-8">
              <div className="day-bar">
                <div
                  className="day-bar-fill"
                  style={{ height: `${(d.completed / d.total) * 100}%` }}
                />
              </div>
              <span className="tiny muted">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hint">
        <p className="hint-text">
          <span className="bold">Insight:</span> You're most consistent on
          weekdays. Try setting weekend reminders to maintain momentum!
        </p>
      </div>
    </div>
  );
};

export default ProgressTab;
