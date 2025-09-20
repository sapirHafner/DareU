import React, { useState, useEffect } from "react";
import "./goals.css";

export default function Goals() {
  const [progress, setProgress] = useState({});
  const [selectedTopics, setSelectedTopics] = useState([]);

  useEffect(() => {
    // קריאת הנושאים שהמשתמש בחר בשאלון
    if (window.surveyAnswers && window.surveyAnswers.selectedTopics) {
      setSelectedTopics(window.surveyAnswers.selectedTopics);
    } else {
      // אם אין נתוני שאלון, השתמש בנושאים דיפולטיביים
      setSelectedTopics(["Building Self-Confidence", "Learning & Growth", "Personal Goals"]);
    }
  }, []);

  const loadProgress = () => {
    try {
      const data = JSON.parse(localStorage.getItem("dareu_progress") || "{}");
      setProgress(data);
    } catch {
      setProgress({});
    }
  };

  useEffect(() => {
    loadProgress();
    const handler = () => loadProgress();
    window.addEventListener("dareu:progress-update", handler);
    return () => window.removeEventListener("dareu:progress-update", handler);
  }, []);

  // פונקציה להמרת שם הנושא לקטגוריה (אותה המרה כמו ב-Challenges)
  const topicToCategory = (topic) => {
    return topic.toLowerCase().replace(/[^a-z]/g, '');
  };

  const GOAL_TARGET = 10; // 10 אתגרים לכל נושא

  return (
    <div className="goals">
      <h2 className="goals__title">Goals</h2>

      {selectedTopics.map((topic) => {
        const categoryKey = topicToCategory(topic);
        const currentProgress = Number(progress[categoryKey] || 0);
        
        return (
          <div key={topic} className="goal-row">
            <div className="goal-row__label">{topic}</div>
            <Circles count={GOAL_TARGET} filled={currentProgress} />
            <div className="goal-row__counter">
              {Math.min(currentProgress, GOAL_TARGET)}/{GOAL_TARGET}
            </div>
          </div>
        );
      })}
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