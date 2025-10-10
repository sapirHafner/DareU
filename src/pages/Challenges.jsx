// src/pages/Challenges.jsx
import React, { useState, useEffect } from "react";
import "./challenges.css";
import React from "react";

const META_KEY = "dareu_meta";
const PROG_KEY = "dareu_progress";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

function getUserId() {
  const KEY = "dareu_uid";
  let id = localStorage.getItem(KEY);
  if (!id) { id = "USER_" + Math.random().toString(36).slice(2, 10); localStorage.setItem(KEY, id); }
  return id;
}
const USER_ID = getUserId();

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
  window.dispatchEvent(new Event("dareu:progress-update"));
}

export default function Challenges() {
  const [challenges, setChallenges] = useState({});           // { [topic]: Challenge[] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);       // { topics, primaryMotivation, currentLevel }
  const [allDoneToday, setAllDoneToday] = useState(false);    // ← הודעת "סיימת הכל להיום"

  // טען פרופיל לתצוגה (כולל הנושאים)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/profile/get?userId=${USER_ID}`);
        if (r.ok) {
          const j = await r.json();
          if (j?.ok) setUserProfile(j.profile);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => { loadChallengesFromAgent(); }, []);

  // עוזר: קבע רשימת נושאים להציג תמיד (בדיוק 3)
  function resolveTopics(dataProposalsTopics = []) {
    const surveyTopics = window.surveyAnswers?.selectedTopics || [];
    const profileTopics = userProfile?.topics || [];
    const planTopics = Array.from(new Set(dataProposalsTopics.filter(Boolean)));
    
    let topics = planTopics.length ? planTopics
                 : profileTopics.length ? profileTopics
                 : surveyTopics.length ? surveyTopics
                 : ["Fitness & Sports", "Learning & Growth", "Communication Skills"]; // ברירת מחדל נעימה
    
    // וודא שיש בדיוק 3 נושאים
    if (topics.length > 3) {
      topics = topics.slice(0, 3);
    } else if (topics.length < 3) {
      const defaults = ["Personal Goals", "Building Self-Confidence", "Time Management"];
      for (const defaultTopic of defaults) {
        if (!topics.includes(defaultTopic) && topics.length < 3) {
          topics.push(defaultTopic);
        }
      }
    }
    
    return topics;
  }

  const loadChallengesFromAgent = async () => {
    try {
      setLoading(true);
      setAllDoneToday(false);

      const surveyData = window.surveyAnswers;
      const userLevel = readMeta().level;

      const response = await fetch(`${API_BASE}/agent/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          // מה שמעניין את ה־planner:
          survey: { topics: surveyData?.selectedTopics || [] },
          profile: {
            topics: surveyData?.selectedTopics || [],
            level: userLevel,
            motivation: surveyData?.primaryMotivation
          },
          availability: { minutesPerSession: 15 }
        })
      });

      if (!response.ok) throw new Error(`Agent request failed: ${response.status}`);
      const data = await response.json();

      // נבנה אובייקט לפי נושאים כך שתמיד יוצגו כל הנושאים של המשתמש
      const proposals = Array.isArray(data.proposals) ? data.proposals : [];
      const topicsToShow = resolveTopics(proposals.map(p => p.topic));

      const grouped = {};
      topicsToShow.forEach(t => grouped[t] = []); // ← גם אם ריק, נשמר להצגה

      proposals.forEach(p => {
        const topic = p.topic || topicsToShow[0] || "general";
        if (grouped[topic]) { // ← וודא שהנושא קיים
          grouped[topic].push({
            id: p.runId,
            title: p.suggestedText || "dareU: Try a tiny step",
            instructions: "",
            difficulty: p.difficulty || "easy",
            est_time_min: p.minutes || 5,
            topic,
            points: 10
          });
        }
      });


      setChallenges(grouped);
      // שמור גם פרופיל שחזר מהתכנון (אם חזר)
      if (data.profile) {
        setUserProfile(prev => ({ ...(prev || {}), ...data.profile }));
      }
      setError(null);
      setAllDoneToday(false); // ← תמיד יהיו משימות
    } catch (err) {
      console.error("Error loading challenges from agent:", err);
      setError(err.message);
      // fallback לאתגרים סטטיים
      loadFallbackChallenges();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackChallenges = () => {
    const surveyData = window.surveyAnswers;
    const profileTopics = userProfile?.topics || [];
    const defaultTopics = ["Fitness & Sports", "Learning & Growth", "Communication Skills"];
    const topicsToUse = profileTopics.length ? profileTopics.slice(0, 3) : 
                       surveyData?.selectedTopics?.slice(0, 3) || defaultTopics;
    
    const fallbackChallenges = {};
    topicsToUse.forEach(topic => {
      fallbackChallenges[topic] = [
        {
          id: `${topic}-1-${Date.now()}`,
          title: `dareU: Take a small step in ${topic}`,
          instructions: "",
          difficulty: "easy",
          est_time_min: 10,
          topic,
          points: 15
        },
        {
          id: `${topic}-2-${Date.now()}`, 
          title: `dareU: Practice ${topic} for 5 minutes`,
          instructions: "",
          difficulty: "easy",
          est_time_min: 5,
          topic,
          points: 10
        }
      ];
    });
    
    setChallenges(fallbackChallenges);
    setAllDoneToday(false); // ← וודא שלא נציג "Well done"
  };

  const recordChallengeDecision = async (challengeId, contentHash, status, points) => {
    try {
      if (status === "success") {
        const resp = await fetch(`${API_BASE}/agent/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: challengeId, evidence: { socialExposure: true } })
        });
        const data = await resp.json();
        return data; // ← מחזירים ל-Row
      } else if (status === "later") {
        await fetch(`${API_BASE}/agent/decision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: challengeId, decision: "reject" })
        });
        return { ok: true };
      }
    } catch (err) {
      console.warn('Failed to record decision to agent:', err);
      return { ok: false, error: String(err) };
    }
  };

  // פונקציה ליצירת אתגר חדש מה-AI - עם וידוא שהוא שונה מהקיים
  const generateNewChallenge = async (topic, existingChallenges = []) => {
    try {
      const surveyData = window.surveyAnswers;
      const userLevel = readMeta().level;
      
      // נסה כמה פעמים לקבל אתגר שונה
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await fetch(`${API_BASE}/agent/plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: USER_ID,
            survey: { topics: [topic] },
            profile: {
              topics: [topic],
              level: userLevel,
              motivation: surveyData?.primaryMotivation
            },
            availability: { minutesPerSession: 15 }
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to generate new challenge: ${response.status}`);
        }

        const data = await response.json();
        
        // מצא אתגר שלא קיים כבר
        const newProposal = (data.proposals || []).find(p => 
          !existingChallenges.some(existing => 
            existing.title === (p.suggestedText || "dareU: Try a tiny step") || 
            existing.id === p.runId
          )
        );
        
        if (newProposal) {
          return {
            id: newProposal.runId,
            title: newProposal.suggestedText || "dareU: Try a tiny step",
            instructions: "",
            difficulty: newProposal.difficulty || "easy",
            est_time_min: newProposal.minutes || 5,
            topic: newProposal.topic || topic,
            points: 10
          };
        }
      }
      
      return null; // אחרי 3 נסיונות, ויתור
      
    } catch (err) {
      console.error('Error generating new challenge:', err);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="ch-page">
        <h1 className="ch-title">Loading Your Personalized Challenges...</h1>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div className="loading-spinner"></div>
          <p>Our AI is crafting challenges just for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ch-page">
        <h1 className="ch-title">Challenges</h1>
        <div style={{ 
          textAlign: "center", 
          padding: "2rem", 
          background: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          margin: "1rem"
        }}>
          <p style={{ color: "#856404", marginBottom: "1rem" }}>
            {error}
          </p>
          <button 
            onClick={loadChallengesFromAgent}
            style={{
              padding: "0.5rem 1rem",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
        
        {Object.keys(challenges).length > 0 && (
          <>
            <p style={{ textAlign: "center", color: "#666" }}>
              Showing backup challenges:
            </p>
            {Object.entries(challenges).map(([topic, topicChallenges]) => (
              <Section 
                key={topic} 
                name={topic} 
                challenges={topicChallenges}
                onChallengeComplete={recordChallengeDecision}
                onGenerateNew={(topicName, existingChallenges) => generateNewChallenge(topicName, existingChallenges)}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="ch-page">
      <h1 className="ch-title">Your AI-Generated Challenges</h1>

      {/* Header with user's topics & motivation */}
      <div style={{
        textAlign: "center",
        marginBottom: "2rem",
        padding: "1rem",
        background: "#f8f9ff",
        borderRadius: "8px",
        border: "1px solid #e9ecef"
      }}>
        <p style={{ margin: "0.5rem 0", color: "#666" }}>
          <strong>Focus Areas:</strong>{" "}
          {(userProfile?.topics || window.surveyAnswers?.selectedTopics || []).join(", ")}
        </p>
        <p style={{ margin: "0.5rem 0", color: "#666" }}>
          <strong>Motivation Style:</strong> {userProfile?.primaryMotivation || userProfile?.motivation || ""}
        </p>
        <p style={{ margin: "0.5rem 0", color: "#666" }}>
          <strong>Your Level:</strong> {userProfile?.currentLevel ?? userProfile?.level ?? readMeta().level}
        </p>
      </div>

      {/* If there are API errors and still have some cached challenges, show them below the banner */}
      {error && (
        <div style={{
          textAlign: "center",
          padding: "1rem",
          background: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          margin: "0 1rem 1.5rem"
        }}>
          <p style={{ color: "#856404", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* All done message */}
      {allDoneToday ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>🎉 Well done!</h2>
          <p style={{ color: "#555" }}>
            You've completed all your challenges for today.
            Check back tomorrow for fresh dares tailored to your goals.
          </p>
        </div>
      ) : (
        <>
          {/* Sections per topic — always rendered, even if empty */}
          {Object.entries(challenges).map(([topic, topicChallenges]) => (
            <Section
              key={topic}
              name={topic}
              challenges={topicChallenges}
              onChallengeComplete={recordChallengeDecision}
              onGenerateNew={generateNewChallenge}
            />
          ))}

          {/* Action row: לא מציגים אם סיימת הכל */}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={loadChallengesFromAgent}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              Generate New Challenges
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ name, challenges, onChallengeComplete, onGenerateNew }) {
  const [items, setItems] = useState(
    () => (challenges || []).map((challenge, i) => ({
      ...challenge,
      id: challenge.id || `${name}-${i}`,
      localStatus: "idle"
    }))
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const remove = (id) => setItems(prev => prev.filter(it => it.id !== id));

  const addNewChallenge = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const newChallenge = await onGenerateNew(name, items);
      if (newChallenge) {
        setItems(prev => [...prev, { ...newChallenge, localStatus: "idle" }]);
      }
    } catch (err) {
      console.error("Failed to generate new challenge:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const showEmpty = !items || items.length === 0;

  return (
    <section className="ch-section">
      <h2 className="ch-section__header">{name}</h2>

      {showEmpty ? (
        <p style={{ color: "#888", textAlign: "center", margin: "0.5rem 0 1rem" }}>
          No open challenges for this topic today.
        </p>
      ) : (
        <ul className="ch-list">
          {items.map(challenge => (
            <ChallengeRow
              key={challenge.id}
              challenge={challenge}
              onRemove={remove}
              onComplete={onChallengeComplete}
              onGenerateNew={addNewChallenge}
              isGenerating={isGenerating}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ChallengeRow({ challenge, onRemove, onComplete, onGenerateNew, isGenerating }) {
  const [status, setStatus] = useState("idle");

  const onMainClick = async () => {
    if (status === "idle" || status === "later") {
      setStatus("success");
    } else if (status === "success") {
      try {
        // יעדכן מטרות/ספירות מקומיות
        const data = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
        const category = challenge.topic?.toLowerCase().replace(/[^a-z]/g, "") || "general";
        const curr = Number(data[category] || 0);
        data[category] = curr + 1;
        localStorage.setItem(PROG_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("dareu:progress-update"));

        // שליחת השלמה לשרת
        const res = await onComplete(challenge.id, challenge.contentHash, "success", challenge.points || 10);

        // נקודות לפי השרת (או fallback)
        const gained = (res && typeof res.points === "number") ? res.points : (challenge.points || 10);
        const meta = readMeta();
        writeMeta(meta.points + gained);
      } catch (e) {
        console.error("Error updating progress:", e);
      }

      onRemove(challenge.id);
    }
  };

  const onLaterClick = async () => {
    setStatus("later");
    
    await onComplete(
      challenge.id, 
      challenge.contentHash, 
      'later', 
      0
    );
    
    onRemove(challenge.id);
    // יצירת אתגר חדש גם אחרי "Later" - העבר את הנושא ואת האתגר הנוכחי
    setTimeout(() => onGenerateNew(challenge.topic, [challenge]), 500);
  };

  return (
    <li className="ch-card">
      <div className="ch-card__content">
        <span className="ch-card__title">{challenge.title}</span>
        {challenge.instructions && challenge.instructions !== "" && (
          <p className="ch-card__instructions">{challenge.instructions}</p>
        )}
        <div className="ch-card__meta">
          <span className="ch-card__time">{challenge.est_time_min || 15} min</span>
          <span className="ch-card__difficulty">{challenge.difficulty}</span>
          <span className="ch-card__points">+{challenge.points || 10} pts</span>
        </div>
        {challenge.psychology_hint && (
          <p className="ch-card__hint">💡 {challenge.psychology_hint}</p>
        )}
      </div>
      
      <div className="ch-actions">
        <button className={`ch-btn ch-btn--main ch-${status}`} onClick={onMainClick}>
          {status === "idle" && "Start"}
          {status === "later" && "Start"}
          {status === "success" && (<><span className="ch-check">✓</span> Success</>)}
        </button>
        {status !== "success" && (
          <button className="ch-btn ch-btn--later" onClick={onLaterClick}>
            {isGenerating ? "Generating..." : "Later"}
          </button>
        )}
      </div>
    </li>
  );
}