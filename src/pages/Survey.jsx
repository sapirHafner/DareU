import React from 'react';
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Survey.css";

// Base API path configurable by Vite env
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

function getUserId() {
  const KEY = "dareu_uid";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "USER_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(KEY, id);
  }
  return id;
}
const USER_ID = getUserId();

/** ✅ Mock agent*/
async function generateQuestionsMock({ answers, topics = [], count = 8 }) {
  const firstTopic = topics[0] || "your goal";
  const questions = Array.from({ length: count }, (_, i) => ({
    id: `q_${Date.now()}_${i}`,
    text: `Mock Q${i + 1}: tiny step toward ${firstTopic}`,
    type: "choice4",
    options: [
      { key: "a", label: "Plan 1 tiny step" },
      { key: "b", label: "Ask a friend for accountability" },
      { key: "c", label: "Turn it into a mini-challenge" },
      { key: "d", label: "Promise yourself a reward" },
    ],
    difficulty: "easy",
    tag: "mock",
  }));
  await new Promise((r) => setTimeout(r, 700));
  return { questions, rationale: "Local mock (no API yet)", basedOn: answers };
}

const TOPICS = [
  "Relationships & Dating","Fitness & Sports","Public Speaking","Financial Management","Career & Work",
  "Building Self-Confidence","Healthy Nutrition","Time Management","Learning & Growth","Creativity",
  "Leadership","Emotional Intelligence","Communication Skills","Spirituality","Parenting",
  "Friendships","Personal Goals","Good Habits","Dealing with Procrastination","Focus & Concentration",
  "Patience","Empathy","Self-Management","Entrepreneurship","Social Skills",
  "Mental Health","Exam Preparation","Professionalism","Inspiration","Personal Responsibility"
];

const PAGES = [
  { id: "topics", title: "Choose your development topic", desc: "Select the area you'd most like to focus on for personal growth", type: "topics", topics: TOPICS },
  {
    id: "push", title: "What motivated you to start?", desc: "First 6 questions",
    questions: [
      { id: "q1", text: "How important is it for you to prove to others that you can succeed?", type: "likert", category: "social" },
      { id: "q2", text: "How much does curiosity make you start new things?", type: "likert", category: "intrinsic" },
      { id: "q3", text: "Does fear of failure push you to try harder?", type: "likert", category: "extrinsic" },
      { id: "q4", text: "When you see others succeed, does it motivate you to try too?", type: "likert", category: "competitive" },
      { id: "q5", text: "Does having a clear goal make you start faster?", type: "likert", category: "task" },
      {
        id: "q6", text: "What usually gives you the first push to start?",
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
    id: "drive", title: "What drives you to keep going", desc: "Final 6 questions",
    questions: [
      { id: "q7", text: "How important are external rewards (money/prizes) for you to keep going?", type: "likert", category: "extrinsic" },
      { id: "q8", text: "Does competing with others energize you?", type: "likert", category: "competitive" },
      { id: "q9", text: "How much do compliments or positive feedback give you energy?", type: "likert", category: "social" },
      { id: "q10", text: "Is enjoying the process itself enough to keep you going?", type: "likert", category: "intrinsic" },
      { id: "q11", text: "Are you more likely to continue when you have partners?", type: "likert", category: "social" },
      {
        id: "q12", text: "What most helps you not give up in the middle?",
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
];

const CATEGORY_META = {
  intrinsic: { label: "Intrinsic", blurb: "Driven by curiosity, personal interest and meaning. You keep going because it matters to you, not only for rewards." },
  extrinsic: { label: "Extrinsic", blurb: "Driven by tangible rewards and results. Clear goals, prizes and achievements motivate you to continue." },
  social:    { label: "Social",    blurb: "Feedback, support and inspiration from people matter to you. Commitment to others lifts your motivation." },
  competitive:{ label: "Competitive", blurb: "You light up from competition and comparison. Seeing progress versus others pushes you to excel." },
  task:      { label: "Task/Discipline", blurb: "Structure, habits and clear goals keep you consistent. You excel at managing the process." },
};

// ---------- UI helpers ----------
const TopicsGrid = ({ topics, selectedTopics, onChange }) => (
  <div className="topics-container">
    <div className="topics-grid">
      {topics.map((topic, idx) => (
        <div
          key={idx}
          className={`topic-box ${selectedTopics.includes(topic) ? "selected" : ""} ${selectedTopics.length >= 3 && !selectedTopics.includes(topic) ? "disabled" : ""}`}
          onClick={() => {
            if (selectedTopics.includes(topic)) {
              onChange(selectedTopics.filter((t) => t !== topic));
            } else if (selectedTopics.length < 3) {
              onChange([...selectedTopics, topic]);
            }
          }}
        >
          <span className="topic-text">{topic}</span>
          {selectedTopics.includes(topic) && <span className="topic-checkmark">✓</span>}
        </div>
      ))}
    </div>
    <div className="topics-counter">Selected: {selectedTopics.length}/3 topics</div>
  </div>
);

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
              <input type="radio" className="likert-radio" checked={value === n} onChange={() => onChange(n)} />
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
      <label key={opt.key} className={`choice4-option ${value === opt.key ? "selected" : ""}`}>
        <input type="radio" className="choice4-radio" checked={value === opt.key} onChange={() => onChange(opt.key)} />
        <span>{opt.label}</span>
      </label>
    ))}
  </div>
);








// ---------- Main ----------
export default function Survey() {
  const navigate = useNavigate();
  const [pageIdx, setPageIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  // Consistent name: selectedTopics is an array
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const current = PAGES[pageIdx];

  const totalQuestions = useMemo(() => {
    let count = 1; // topic selection counts as one item
    for (let i = 1; i < PAGES.length; i++) {
      if (PAGES[i].questions) count += PAGES[i].questions.length;
    }
    return count;
  }, []);

  const answeredCount = useMemo(() => {
    let count = 0;
    if (selectedTopics.length === 3) count++;
    count += Object.keys(answers).length;
    return count;
  }, [answers, selectedTopics]);

  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const pageComplete = useMemo(() => {
    if (current.type === "topics") return selectedTopics.length === 3;
    return current.questions?.every((q) => answers[q.id] !== undefined) ?? false;
  }, [current, answers, selectedTopics]);

  function setAnswer(q, val) {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  }

  function next() {
    if (pageIdx < PAGES.length - 1) setPageIdx((i) => i + 1);
  }
  function prev() {
    if (pageIdx > 0) setPageIdx((i) => i - 1);
  }

  const scores = useMemo(() => {
    const s = { intrinsic: 0, extrinsic: 0, social: 0, competitive: 0, task: 0 };
    for (const page of PAGES) {
      if (!page.questions) continue;
      for (const q of page.questions) {
        const v = answers[q.id];
        if (v === undefined) continue;
        if (q.type === "likert") s[q.category] += Number(v);
        else {
          const picked = q.options.find((o) => o.key === v);
          if (picked) s[picked.category] += 1;
        }
      }
    }
    return s;
  }, [answers]);

  const maxScores = useMemo(() => {
    const m = { intrinsic: 0, extrinsic: 0, social: 0, competitive: 0, task: 0 };
    for (const page of PAGES) {
      if (!page.questions) continue;
      for (const q of page.questions) {
        if (q.type === "likert") m[q.category] += 5;
        else {
          for (const opt of q.options) m[opt.category] += 1;
        }
      }
    }
    return m;
  }, []);

  const normalized = useMemo(() => {
    const obj = {};
    for (const k of Object.keys(scores)) {
      const max = Math.max(1, maxScores[k]);
      obj[k] = scores[k] / max;
    }
    return obj;
  }, [scores, maxScores]);

  const allDone = answeredCount === totalQuestions;

  const sortedCats = useMemo(() => {
    return Object.keys(scores).sort((a, b) => normalized[b] - normalized[a]);
  }, [normalized, scores]);

  async function finishSurvey() {
    if (submitting || hasFinished) return;

    setSubmitting(true);
    try {
      const surveyData = {
        selectedTopics,                 // keep the selected topic array
        answers,
        scores,
        normalized,
        primaryMotivation: sortedCats[0],
      };

      // store survey data on window for local access
      window.surveyAnswers = surveyData;
      
      // generate mock questions
      const payload = await generateQuestionsMock({
        answers: surveyData,
        topics: selectedTopics,        // do not wrap in another array
        count: 8,
      });

      window.generatedQuestions = payload;

      // persist profile to backend
      await fetch(`${API_BASE}/profile/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          topics: selectedTopics,                      // consistent profile topics
          motivation: surveyData.primaryMotivation,    // primaryMotivation -> motivation
          level: "beginner",                           // or decide based on normalized scores
          answers,
          scores,
          normalized,
          availability: null
        })
      });

      setHasFinished(true);

      setTimeout(() => {
        navigate("/home");
      }, 3000);
    } catch (e) {
      console.error("Error finishing survey:", e);
      setSubmitting(false);
    }
  }

  function handleContinue() {
    finishSurvey();
  }

  useEffect(() => {
    if (allDone && !hasFinished && !submitting) {
      setShowContinueButton(true);
    }
  }, [allDone, hasFinished, submitting]);

  return (
    <div className="questionnaire-container" dir="ltr">
      {submitting && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span className="loading-text">Analyzing your answers...</span>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <h1 className="title">Personal Development Survey</h1>
        <p className="subtitle">Choose your focus area and answer questions to get personalized recommendations.</p>
      </div>

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} aria-label={`Progress ${progress}%`} />
      </div>

      {/* Page Card */}
      {!allDone ? (
        <div className="page-card">
          <div className="page-header">
            <h2 className="page-title">{current.title}</h2>
            <span className="page-counter">Page {pageIdx + 1} / {PAGES.length}</span>
          </div>
          <p className="page-desc">{current.desc}</p>

          {current.type === "topics" ? (
            <TopicsGrid topics={current.topics} selectedTopics={selectedTopics} onChange={setSelectedTopics} />
          ) : (
            <ol className="questions-list">
              {current.questions?.map((q, idx) => (
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
                          <Choice4 options={q.options} value={answers[q.id]} onChange={(k) => setAnswer(q, k)} />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Nav buttons */}
          <div className="nav-buttons">
            <button onClick={prev} disabled={pageIdx === 0 || submitting} className="nav-button back-button">Back</button>
            <button onClick={pageComplete ? next : undefined} disabled={!pageComplete || submitting} className="nav-button next-button">Next</button>
          </div>
        </div>
      ) : (
        <Results
          scores={scores}
          maxScores={maxScores}
          normalized={normalized}
          sortedCats={sortedCats}
          selectedTopics={selectedTopics}   // pass the topic array
          showContinueButton={showContinueButton}
          onContinue={handleContinue}
          submitting={submitting}
        />
      )}

      {allDone && !submitting && (
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

function Results({ scores, maxScores, normalized, sortedCats, selectedTopics, showContinueButton, onContinue, submitting }) {
  const primary = sortedCats[0];
  const secondary = sortedCats.slice(1, 3);

  return (
    <div className="results-container">
      <h2 className="results-title">Your Results</h2>
      <p className="results-subtitle">
        Based on your chosen topics: <strong>{selectedTopics.join(", ")}</strong>
      </p>

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
        Bars show your score relative to the maximum possible in each category.
      </p>

      {showContinueButton && !submitting && (
        <div className="restart-section">
          <button onClick={onContinue} className="restart-button" style={{ background: "linear-gradient(135deg, var(--peach-500), var(--coral-500))" }}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}