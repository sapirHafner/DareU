// src/pages/Challenges.jsx
import { useState } from "react";
import "./challenges.css";

const SEED = {
  social: ["Say hello to a stranger", "Call a friend you miss"],
  fitness: ["Walk 6,000 steps", "10-min mobility"],
  creativity: ["Sketch for 5 minutes", "Write 100 words"],
};

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
            category={name.toLowerCase()}  // לצבירת התקדמות לפי קטגוריה
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
      // לחיצה על Success מוחקת את המשימה ומעדכנת מטרות
      try {
        const key = "dareu_progress";
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        const curr = Number(data[category] || 0);
        data[category] = curr + 1;
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
      onRemove(id);
    }
  };

  const onLaterClick = () => {
    setStatus("later");
    onRemove(id); // לא נחשב כהצלחה
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
