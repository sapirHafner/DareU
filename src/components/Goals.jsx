import { useEffect, useState } from "react";
import "./goals.css";

const DEFAULT_TOPICS = [
  "Building Self-Confidence",
  "Learning & Growth",
  "Personal Goals",
];

const GOAL_TARGET = 10;
const PROGRESS_STORAGE_KEY = "dareu_progress";

function normalizeTopicKey(topic) {
  return topic.toLowerCase().replace(/[^a-z]/g, "");
}

function getStoredProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function Goals() {
  const [progress, setProgress] = useState(() => getStoredProgress());
  const [selectedTopics, setSelectedTopics] = useState(DEFAULT_TOPICS);

  useEffect(() => {
    const savedTopics = window.surveyAnswers?.selectedTopics;
    if (Array.isArray(savedTopics) && savedTopics.length > 0) {
      setSelectedTopics(savedTopics);
    }
  }, []);

  useEffect(() => {
    const updateProgress = () => setProgress(getStoredProgress());
    updateProgress();

    window.addEventListener("dareu:progress-update", updateProgress);
    return () => window.removeEventListener("dareu:progress-update", updateProgress);
  }, []);

  return (
    <section className="goals">
      <h2 className="goals__title">Goals</h2>

      {selectedTopics.map((topic) => {
        const categoryKey = normalizeTopicKey(topic);
        const currentProgress = Number(progress[categoryKey] || 0);
        const filledCount = Math.min(currentProgress, GOAL_TARGET);

        return (
          <div key={topic} className="goal-row">
            <div className="goal-row__label">{topic}</div>
            <Circles count={GOAL_TARGET} filled={filledCount} />
            <div className="goal-row__counter">{filledCount}/{GOAL_TARGET}</div>
          </div>
        );
      })}
    </section>
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