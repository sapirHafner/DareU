// src/pages/Challenges.jsx
import { useState } from "react";
import "./challenges.css";
import React from "react";

const SEED = {
  social: ["Say hello to a stranger", "Call a friend you miss"],
  fitness: ["Walk 6,000 steps", "10-min mobility"],
  creativity: ["Sketch for 5 minutes", "Write 100 words"],
};

const META_KEY = "dareu_meta";
const PROG_KEY = "dareu_progress";

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

function writeMeta(points) {
  const level = 1 + Math.floor(points / 100);
  localStorage.setItem(META_KEY, JSON.stringify({ points, level }));
  // עדכן את דף ה-Journey בלייב אם פתוח
  window.dispatchEvent(new Event("dareu:progress-update"));
}

export default function Challenges() {
  return (
    <div className="ch-page">
      <h1 className="ch-title">Challenges</h1>
      <Section name="Social" seed={SEED.social} />
      <Section name="Fitness" seed={SEED.fitness} />
      <Section name="Creativity" seed={SEED.creativity} />
    </div>
  );
}

function Section({ name, seed }) {
  const [items, setItems] = useState(
    () => seed.map((title, i) => ({ id: `${name}-${i}`, title }))
  );

  const remove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  return (
    <section className="ch-section">
      <h2 className="ch-section__header">{name}</h2>
      <ul className="ch-list">
        {items.map((it) => (
          <ChallengeRow
            key={it.id}
            id={it.id}
            title={it.title}
            category={name.toLowerCase()}
            onRemove={remove}
          />
        ))}
      </ul>
    </section>
  );
}

function ChallengeRow({ id, title, category, onRemove }) {
  // idle | success | later
  const [status, setStatus] = useState("idle");

  const onMainClick = () => {
    if (status === "idle" || status === "later") {
      // Start -> Success (ירוק)
      setStatus("success");
    } else if (status === "success") {
      // Success -> מחיקה + עדכון נקודות/דרגה + עדכון מטרות
      try {
        // 1) עדכון נקודות/דרגה
        const meta = readMeta();
        const newPoints = meta.points + 10; // +10 לכל הצלחה
        writeMeta(newPoints);

        // 2) עדכון מטרות לפי קטגוריה (לשימור הויזואליזציה ב-Goals)
        const data = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
        const curr = Number(data[category] || 0);
        data[category] = curr + 1;
        localStorage.setItem(PROG_KEY, JSON.stringify(data));
      } catch {}
      onRemove(id);
    }
  };

  const onLaterClick = () => {
    setStatus("later");
    onRemove(id); // לא מוסיף נקודות
  };

  return (
    <li className="ch-card">
      <span className="ch-card__title">{title}</span>
      <div className="ch-actions">
        <button className={`ch-btn ch-btn--main ch-${status}`} onClick={onMainClick}>
          {status === "idle" && "Start"}
          {status === "later" && "Start"}
          {status === "success" && (<><span className="ch-check">✓</span> Success</>)}
        </button>
        {status !== "success" && (
          <button className="ch-btn ch-btn--later" onClick={onLaterClick}>Later</button>
        )}
      </div>
    </li>
  );
}
