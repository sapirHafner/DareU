// src/components/Goals.jsx
import { useEffect, useState } from "react";
import "./goals.css";

// כמות עיגולים לכל תחום (ניתן לשנות)
const GOAL_TARGETS = { social: 10, fitness: 10, creativity: 10 };
const TITLES = { social: "Social", fitness: "Fitness", creativity: "Creativity" };

export default function Goals() {
  const [progress, setProgress] = useState({ social: 0, fitness: 0, creativity: 0 });

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("dareu_progress") || "{}");
      setProgress({
        social: Number(data.social || 0),
        fitness: Number(data.fitness || 0),
        creativity: Number(data.creativity || 0),
      });
    } catch {}
  }, []);

  return (
    <div className="goals">
      <h2 className="goals__title">Goals</h2>

      {Object.keys(GOAL_TARGETS).map((key) => (
        <div key={key} className="goal-row">
          <div className="goal-row__label">{TITLES[key]}</div>
          <Circles count={GOAL_TARGETS[key]} filled={progress[key]} />
          <div className="goal-row__counter">
            {Math.min(progress[key], GOAL_TARGETS[key])}/{GOAL_TARGETS[key]}
          </div>
        </div>
      ))}
    </div>
  );
}

function Circles({ count, filled }) {
  const n = Math.max(0, count);
  const f = Math.max(0, Math.min(filled || 0, n));
  return (
    <div className="circles">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={"circle" + (i < f ? " circle--filled" : "")} />
      ))}
    </div>
  );
}
