// src/pages/Challenges.jsx
import React, { useState, useEffect } from "react";
import "./challenges.css";

const META_KEY = "dareu_meta";
const PROG_KEY = "dareu_progress";
const USER_ID = "user_" + Math.random().toString(36).substr(2, 9); // מזהה זמני

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
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadChallengesFromAgent();
  }, []);

  const loadChallengesFromAgent = async () => {
    try {
      setLoading(true);
      
      // קבלת נתוני השאלון
      const surveyData = window.surveyAnswers;
      const userLevel = readMeta().level;
      
      if (!surveyData) {
        setError("Please complete the survey first to get personalized challenges");
        setLoading(false);
        return;
      }

      // קריאה לסוכן
      const response = await fetch('http://localhost:5050/agent/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          surveyData: surveyData,
          userLevel: userLevel,
          availability: {
            minutesPerSession: 15
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Agent request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // ארגון האתגרים לפי נושאים
      const challengesByTopic = {};
      data.challenges.forEach(challenge => {
        if (!challengesByTopic[challenge.topic]) {
          challengesByTopic[challenge.topic] = [];
        }
        challengesByTopic[challenge.topic].push(challenge);
      });

      setChallenges(challengesByTopic);
      setUserProfile(data.profile);
      setError(null);
      
    } catch (err) {
      console.error('Error loading challenges from agent:', err);
      setError(err.message);
      
      // fallback לאתגרים סטטיים
      loadFallbackChallenges();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackChallenges = () => {
    const surveyData = window.surveyAnswers;
    const defaultTopics = ["Building Self-Confidence", "Learning & Growth", "Personal Goals"];
    const topicsToUse = surveyData?.selectedTopics || defaultTopics;
    
    const fallbackChallenges = {};
    topicsToUse.forEach(topic => {
      fallbackChallenges[topic] = [
        {
          id: `${topic}-1`,
          title: `dareU: Take a small step in ${topic}`,
          instructions: "",
          difficulty: "easy",
          est_time_min: 10,
          tags: ["fallback"],
          points: 15
        },
        {
          id: `${topic}-2`, 
          title: `dareU: Practice ${topic} for 5 minutes`,
          instructions: "",
          difficulty: "easy",
          est_time_min: 5,
          tags: ["fallback"],
          points: 10
        }
      ];
    });
    
    setChallenges(fallbackChallenges);
  };

  const recordChallengeDecision = async (challengeId, contentHash, status, points) => {
    try {
      await fetch('http://localhost:5050/agent/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          challengeId,
          contentHash,
          status,
          mode: 'solo',
          points,
          metadata: { timestamp: Date.now() }
        })
      });
    } catch (err) {
      console.warn('Failed to record decision to agent:', err);
    }
  };

  // פונקציה ליצירת אתגר חדש מה-AI - עם וידוא שהוא שונה מהקיים
  const generateNewChallenge = async (topic, existingChallenges = []) => {
    try {
      const surveyData = window.surveyAnswers;
      const userLevel = readMeta().level;
      
      // נסה כמה פעמים לקבל אתגר שונה
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await fetch('http://localhost:5050/agent/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: USER_ID,
            surveyData: { ...surveyData, selectedTopics: [topic] },
            userLevel: userLevel,
            availability: {
              minutesPerSession: 15
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to generate new challenge: ${response.status}`);
        }

        const data = await response.json();
        
        // מצא אתגר שלא קיים כבר
        const newChallenge = data.challenges?.find(challenge => 
          !existingChallenges.some(existing => 
            existing.title === challenge.title || 
            existing.contentHash === challenge.contentHash
          )
        );
        
        if (newChallenge) {
          return newChallenge;
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
      {userProfile && (
        <div style={{ 
          textAlign: "center", 
          marginBottom: "2rem",
          padding: "1rem",
          background: "#f8f9ff",
          borderRadius: "8px",
          border: "1px solid #e9ecef"
        }}>
          <p style={{ margin: "0.5rem 0", color: "#666" }}>
            <strong>Focus Areas:</strong> {userProfile.topics?.join(", ")}
          </p>
          <p style={{ margin: "0.5rem 0", color: "#666" }}>
            <strong>Motivation Style:</strong> {userProfile.primaryMotivation}
          </p>
          <p style={{ margin: "0.5rem 0", color: "#666" }}>
            <strong>Your Level:</strong> {userProfile.currentLevel}
          </p>
        </div>
      )}
      
      {Object.keys(challenges).length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>No challenges available. Please try refreshing.</p>
          <button onClick={loadChallengesFromAgent}>Refresh Challenges</button>
        </div>
      ) : (
        Object.entries(challenges).map(([topic, topicChallenges]) => (
          <Section 
            key={topic} 
            name={topic} 
            challenges={topicChallenges}
            onChallengeComplete={recordChallengeDecision}
            onGenerateNew={generateNewChallenge}
          />
        ))
      )}
      
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
    </div>
  );
}

function Section({ name, challenges, onChallengeComplete, onGenerateNew }) {
  const [items, setItems] = useState(
    () => challenges.map((challenge, i) => ({ 
      ...challenge,
      id: challenge.id || `${name}-${i}`,
      localStatus: "idle"
    }))
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const remove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const addNewChallenge = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      // העבר את האתגרים הקיימים כדי למנוע כפילויות
      const newChallenge = await onGenerateNew(name, items);
      if (newChallenge) {
        setItems(prev => [...prev, {
          ...newChallenge,
          localStatus: "idle"
        }]);
      }
    } catch (err) {
      console.error('Failed to generate new challenge:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="ch-section">
      <h2 className="ch-section__header">{name}</h2>
      <ul className="ch-list">
        {items.map((challenge) => (
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
        // עדכון נקודות מקומי
        const meta = readMeta();
        const newPoints = meta.points + (challenge.points || 10);
        writeMeta(newPoints);

        // עדכון מטרות
        const data = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
        const category = challenge.topic?.toLowerCase().replace(/[^a-z]/g, '') || 'general';
        const curr = Number(data[category] || 0);
        data[category] = curr + 1;
        localStorage.setItem(PROG_KEY, JSON.stringify(data));
        
        window.dispatchEvent(new Event("dareu:progress-update"));

        // שליחה לסוכן
        await onComplete(
          challenge.id, 
          challenge.contentHash, 
          'success', 
          challenge.points || 10
        );

      } catch (error) {
        console.error("Error updating progress:", error);
      }
      
      onRemove(challenge.id);
      // יצירת אתגר חדש אחרי השלמה - העבר את הנושא ואת האתגרים הקיימים
      setTimeout(() => onGenerateNew(challenge.topic, [challenge]), 500);
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