import React, { useMemo, useState } from "react";
import './Survey.css';

// =============================
// EN version + last 6 questions as 4-option choices
// =============================

const PAGES = [
  {
    id: "push",
    title: "What motiveted you to start ?",
    desc: "First 6 questions",
    questions: [
      { id: "q1", text: "How important is it for you to prove to others that you can succeed?", type: "likert", category: "social" },
      { id: "q2", text: "How much does curiosity make you start new things?", type: "likert", category: "intrinsic" },
      { id: "q3", text: "Does fear of failure push you to try harder?", type: "likert", category: "extrinsic" },
      { id: "q4", text: "When you see others succeed, does it motivate you to try too?", type: "likert", category: "competitive" },
      { id: "q5", text: "Does having a clear goal make you start faster?", type: "likert", category: "task" },
      {
        id: "q6",
        text: "What usually gives you the first push to start?",
        type: "choice4",
        options: [
          { key: "a", label: "Curiosity", category: "intrinsic" },
          { key: "b", label: "Proving myself", category: "social" },
          { key: "c", label: "Competition", category: "competitive" },
          { key: "d", label: "Inspiration from people", category: "social" },
        ],
      },
    ],
  },
  {
    id: "drive",
    title: "What drives you to keep going",
    desc: "Next 6 questions",
    questions: [
      { id: "q7", text: "How important are external rewards (money/prizes) for you to keep going?", type: "likert", category: "extrinsic" },
      { id: "q8", text: "Does competing with others energize you?", type: "likert", category: "competitive" },
      { id: "q9", text: "How much do compliments or positive feedback give you energy?", type: "likert", category: "social" },
      { id: "q10", text: "Is enjoying the process itself enough to keep you going?", type: "likert", category: "intrinsic" },
      { id: "q11", text: "Are you more likely to continue when you have partners?", type: "likert", category: "social" },
      {
        id: "q12",
        text: "What most helps you not give up in the middle?",
        type: "choice4",
        options: [
          { key: "a", label: "Rewards / results", category: "extrinsic" },
          { key: "b", label: "Support from people", category: "social" },
          { key: "c", label: "Competition", category: "competitive" },
          { key: "d", label: "Personal interest", category: "intrinsic" },
        ],
      },
    ],
  },
  {
    id: "persist",
    title: "What helps you persist over time",
    desc: "Final 6 questions",
    questions: [
      {
        id: "q13",
        text: "What best helps you stay consistent?",
        type: "choice4",
        options: [
          { key: "a", label: "A fixed routine", category: "task" },
          { key: "b", label: "A clear long-term goal", category: "task" },
          { key: "c", label: "Accountability to someone", category: "social" },
          { key: "d", label: "A small daily challenge", category: "competitive" },
        ],
      },
      {
        id: "q14",
        text: "When motivation fades, what do you rely on most?",
        type: "choice4",
        options: [
          { key: "a", label: "Self-discipline / schedule", category: "task" },
          { key: "b", label: "Remembering why it matters", category: "intrinsic" },
          { key: "c", label: "A reward I promised myself", category: "extrinsic" },
          { key: "d", label: "A friend/coach checking in", category: "social" },
        ],
      },
      {
        id: "q15",
        text: "What would make you not give up?",
        type: "choice4",
        options: [
          { key: "a", label: "Public commitment", category: "social" },
          { key: "b", label: "Tracking results and streaks", category: "task" },
          { key: "c", label: "Friendly competition", category: "competitive" },
          { key: "d", label: "Tying it to a personal value", category: "intrinsic" },
        ],
      },
      {
        id: "q16",
        text: "When you get stuck, what gets you moving again?",
        type: "choice4",
        options: [
          { key: "a", label: "Break it into a tiny first step", category: "task" },
          { key: "b", label: "Ask someone for help", category: "social" },
          { key: "c", label: "Turn it into a game/challenge", category: "competitive" },
          { key: "d", label: "Give myself a small reward", category: "extrinsic" },
        ],
      },
    ],
  },
];

// Friendly labels & descriptions for the final profile
const CATEGORY_META = {
  intrinsic: { label: "Intrinsic", blurb: "Driven by curiosity, personal interest and meaning. You keep going because it matters to you, not only for rewards." },
  extrinsic: { label: "Extrinsic", blurb: "Driven by tangible rewards and results. Clear goals, prizes and achievements motivate you to continue." },
  social:    { label: "Social",    blurb: "Feedback, support and inspiration from people matter to you. Commitment to others lifts your motivation." },
  competitive:{ label: "Competitive", blurb: "You light up from competition and comparison. Seeing progress versus others pushes you to excel." },
  task:      { label: "Task/Discipline", blurb: "Structure, habits and clear goals keep you consistent. You excel at managing the process." },
};

// -----------------------------
// UI helpers
// -----------------------------

const Likert = ({ value, onChange }) => {
  const steps = [1, 2, 3, 4, 5];
  return (
    <div className="likert-container">
      <div className="likert-scale">
        <span className="likert-label-right">Not at all</span>
        <div className="likert-options">
          {steps.map((n) => (
            <div key={n} className="likert-option">
              <span className="likert-number">{n}</span>
              <input
                type="radio"
                className="likert-radio"
                checked={value === n}
                onChange={() => onChange(n)}
              />
            </div>
          ))}
        </div>
        <span className="likert-label-left">Very much</span>
      </div>
    </div>
  );
};

const Choice4 = ({ options, value, onChange }) => (
  <div className="choice4-container">
    {options.map((opt) => (
      <label
        key={opt.key}
        className={`choice4-option ${value === opt.key ? 'selected' : ''}`}
      >
        <input
          type="radio"
          className="choice4-radio"
          checked={value === opt.key}
          onChange={() => onChange(opt.key)}
        />
        <span>{opt.label}</span>
      </label>
    ))}
  </div>
);

// -----------------------------
// Main component
// -----------------------------

export default function Survey() {
  const [pageIdx, setPageIdx] = useState(0);
  // answers: questionId -> number | string
  const [answers, setAnswers] = useState({});

  const current = PAGES[pageIdx];

  const totalQuestions = useMemo(() => PAGES.reduce((acc, p) => acc + p.questions.length, 0), []);
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const pageComplete = useMemo(() => {
    return current.questions.every((q) => answers[q.id] !== undefined);
  }, [current, answers]);

  function setAnswer(q, val) {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  }

  function next() {
    if (pageIdx < PAGES.length - 1) setPageIdx((i) => i + 1);
  }

  function prev() {
    if (pageIdx > 0) setPageIdx((i) => i - 1);
  }

  // Compute scores by category (raw)
  const scores = useMemo(() => {
    const s = { intrinsic: 0, extrinsic: 0, social: 0, competitive: 0, task: 0 };
    for (const page of PAGES) {
      for (const q of page.questions) {
        const v = answers[q.id];
        if (v === undefined) continue;
        if (q.type === "likert") {
          s[q.category] += Number(v); // add 1..5
        } else {
          const picked = q.options.find((o) => o.key === v);
          if (picked) s[picked.category] += 1; // +1 to the chosen category
        }
      }
    }
    return s;
  }, [answers]);

  // Compute maximum possible score per category (for normalization)
  const maxScores = useMemo(() => {
    const m = { intrinsic: 0, extrinsic: 0, social: 0, competitive: 0, task: 0 };
    for (const page of PAGES) {
      for (const q of page.questions) {
        if (q.type === "likert") {
          m[q.category] += 5; // max for likert
        } else {
          // a choice4 question can contribute at most +1 to any category listed as an option
          for (const opt of q.options) {
            m[opt.category] += 1;
          }
        }
      }
    }
    return m;
  }, []);

  // Normalized (0-1) per category for ranking and display
  const normalized = useMemo(() => {
    const obj = {};
    for (const k of Object.keys(scores)) {
      const max = Math.max(1, maxScores[k]);
      obj[k] = scores[k] / max; // 0..1
    }
    return obj;
  }, [scores, maxScores]);

  const allDone = answeredCount === totalQuestions;

  const sortedCats = useMemo(() => {
    return Object.keys(scores).sort((a, b) => normalized[b] - normalized[a]);
  }, [normalized, scores]);

  return (
    <div className="questionnaire-container" dir="ltr">
      {/* Header */}
      <div className="header">
        <h1 className="title">Motivation Questionnaire</h1>
        <p className="subtitle">18 questions in 3 steps. Answer what fits you best.</p>
      </div>

      {/* Progress */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
          aria-label={`Progress ${progress}%`}
        />
      </div>

      {/* Page Card */}
      {!allDone ? (
        <div className="page-card">
          <div className="page-header">
            <h2 className="page-title">{current.title}</h2>
            <span className="page-counter">Page {pageIdx + 1} / {PAGES.length}</span>
          </div>
          <p className="page-desc">{current.desc}</p>

          <ol className="questions-list">
            {current.questions.map((q, idx) => (
              <li key={q.id} className="question-item">
                <div className="question-content">
                  <div>
                    <p className="question-text">{idx + 1}. {q.text}</p>
                    {q.type === "likert" ? (
                      <div className="question-input">
                        <Likert value={answers[q.id]} onChange={(n) => setAnswer(q, n)} />
                      </div>
                    ) : (
                      <div className="question-input">
                        <Choice4
                          options={q.options}
                          value={answers[q.id]}
                          onChange={(k) => setAnswer(q, k)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* Nav buttons */}
          <div className="nav-buttons">
            <button
              onClick={prev}
              disabled={pageIdx === 0}
              className="nav-button back-button"
            >
              Back
            </button>
            <button
              onClick={pageComplete ? next : undefined}
              disabled={!pageComplete}
              className="nav-button next-button"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <Results scores={scores} maxScores={maxScores} normalized={normalized} sortedCats={sortedCats} />
      )}

      {/* Show analysis only after completing all questions */}
      {allDone && (
        <div className="analysis-section">
          <details className="analysis-details">
            <summary className="analysis-summary">Detailed analysis — raw scores</summary>
            <pre className="analysis-content">{JSON.stringify(scores, null, 2)}</pre>
          </details>

          <details className="analysis-details">
            <summary className="analysis-summary">Detailed analysis — normalized scores</summary>
            <pre className="analysis-content">{JSON.stringify(normalized, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function Results({ scores, maxScores, normalized, sortedCats }) {
  const primary = sortedCats[0];
  const secondary = sortedCats.slice(1, 3);

  return (
    <div className="results-container">
      <h2 className="results-title">Your result</h2>
      <p className="results-subtitle">Your profile is based on normalized scores per category so everything is on the same scale.</p>

      {/* Primary card */}
      <div className="primary-card">
        <h3 className="primary-title">Primary driver: {CATEGORY_META[primary].label}</h3>
        <p className="primary-desc">{CATEGORY_META[primary].blurb}</p>
      </div>

      {/* Secondary */}
      <div className="secondary-grid">
        {secondary.map((cat) => (
          <div key={cat} className="secondary-card">
            <h4 className="secondary-title">Secondary: {CATEGORY_META[cat].label}</h4>
            <p className="secondary-desc">{CATEGORY_META[cat].blurb}</p>
          </div>
        ))}
      </div>

      {/* Score bars */}
      <div className="scores-container">
        {Object.entries(scores).map(([cat, val]) => {
          const max = Math.max(1, maxScores[cat]);
          const pct = Math.round((val / max) * 100);
          return (
            <div key={cat} className="score-item">
              <div className="score-header">
                <span className="score-label">{CATEGORY_META[cat].label}</span>
                <span className="score-percentage">{pct}%</span>
              </div>
              <div className="score-bar-container">
                <div className="score-bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="score-details">{val} / {max} pts</div>
            </div>
          );
        })}
      </div>

      <p className="scoring-explanation">
        Raw score = sum of Likert answers (1–5) per category + 1 point for each 4-choice selection in the chosen category.
        Bars show your score relative to the maximum possible in each category (so everything is comparable).
      </p>

      <div className="restart-section">
        <button
          onClick={() => window.location.reload()}
          className="restart-button"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
