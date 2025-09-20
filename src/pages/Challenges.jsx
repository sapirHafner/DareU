// src/pages/Challenges.jsx
import React, { useState, useEffect } from "react";
import "./challenges.css";

//    היברידי התחלתי לפני הסוכן שיצרתי אפשר לשנות אחרי זה או להשאיר שיהיה היברידי ,בנק אתגרים לפי כל הנושאים האפשריים מהשאלון
const CHALLENGES_BY_TOPIC = {
  "Relationships & Dating": [
    "Send a thoughtful message to someone you care about",
    "Plan a meaningful conversation with your partner",
    "Practice active listening in your next interaction"
  ],
  "Fitness & Sports": [
    "Walk 6,000 steps today",
    "Try a 10-minute mobility routine",
    "Do a short workout or physical activity"
  ],
  "Public Speaking": [
    "Practice speaking in front of a mirror for 5 minutes",
    "Share your opinion in a group conversation",
    "Record yourself giving a 2-minute speech"
  ],
  "Financial Management": [
    "Track all your expenses for today",
    "Set aside 5% of your income for savings",
    "Research one investment or financial tool"
  ],
  "Career & Work": [
    "Update one section of your resume",
    "Learn a new skill related to your field for 20 minutes",
    "Reach out to one professional contact"
  ],
  "Building Self-Confidence": [
    "Write down 3 things you're proud of today",
    "Try something slightly outside your comfort zone",
    "Practice positive self-talk for 10 minutes"
  ],
  "Healthy Nutrition": [
    "Eat one extra serving of vegetables",
    "Drink 8 glasses of water today",
    "Try cooking a healthy new recipe"
  ],
  "Time Management": [
    "Use the Pomodoro technique for 1 hour",
    "Plan tomorrow's top 3 priorities",
    "Eliminate one time-wasting activity today"
  ],
  "Learning & Growth": [
    "Read for 20 minutes on a topic that interests you",
    "Watch an educational video or documentary",
    "Practice a new skill for 15 minutes"
  ],
  "Creativity": [
    "Sketch for 5 minutes",
    "Write 100 words about anything",
    "Try a creative DIY project"
  ],
  "Leadership": [
    "Volunteer to help someone with a task",
    "Practice giving constructive feedback",
    "Take initiative in a group situation"
  ],
  "Emotional Intelligence": [
    "Practice recognizing your emotions throughout the day",
    "Show empathy in one interaction",
    "Use breathing exercises when you feel stressed"
  ],
  "Communication Skills": [
    "Have a meaningful conversation with someone",
    "Practice saying 'no' politely to one request",
    "Give someone genuine constructive feedback"
  ],
  "Spirituality": [
    "Meditate for 10 minutes",
    "Write in a gratitude journal",
    "Spend 15 minutes in nature mindfully"
  ],
  "Parenting": [
    "Spend 15 minutes of quality time with your child",
    "Practice patience in a challenging parenting moment",
    "Teach your child something new"
  ],
  "Friendships": [
    "Reach out to an old friend you haven't spoken to",
    "Be a good listener to a friend today",
    "Plan a fun activity with a friend"
  ],
  "Personal Goals": [
    "Work on your main personal goal for 30 minutes",
    "Break down a big goal into 3 smaller steps",
    "Celebrate a recent achievement you've made"
  ],
  "Good Habits": [
    "Stick to your morning routine perfectly",
    "Replace one bad habit with a good one today",
    "Track a habit you want to build"
  ],
  "Dealing with Procrastination": [
    "Complete one task you've been avoiding",
    "Use the 2-minute rule for small tasks",
    "Remove one distraction from your workspace"
  ],
  "Focus & Concentration": [
    "Work distraction-free for 25 minutes",
    "Practice single-tasking for one hour",
    "Organize and clean your workspace"
  ],
  "Patience": [
    "Take 3 deep breaths before responding to frustration",
    "Wait 10 seconds before reacting to something annoying",
    "Practice mindful waiting in a queue or traffic"
  ],
  "Empathy": [
    "Try to understand someone else's perspective in a disagreement",
    "Help someone without being asked",
    "Listen to someone without trying to fix their problem"
  ],
  "Self-Management": [
    "Stick to a schedule you set for yourself",
    "Say no to one unimportant request",
    "Reflect on your day and what you learned"
  ],
  "Entrepreneurship": [
    "Brainstorm one business idea for 15 minutes",
    "Research your target market for a potential business",
    "Take one small step toward a business goal"
  ],
  "Social Skills": [
    "Start a conversation with someone new",
    "Practice making eye contact in conversations",
    "Give someone a genuine compliment"
  ],
  "Mental Health": [
    "Practice mindfulness for 10 minutes",
    "Do one thing that brings you joy",
    "Talk to someone about how you're feeling"
  ],
  "Exam Preparation": [
    "Study for 30 minutes without any distractions",
    "Create flashcards for key concepts",
    "Take a practice test or quiz"
  ],
  "Professionalism": [
    "Dress professionally for the entire day",
    "Improve your email communication style",
    "Be punctual to all your appointments"
  ],
  "Inspiration": [
    "Read an inspiring quote or story",
    "Share some motivation with someone who needs it",
    "Do something that inspires you personally"
  ],
  "Personal Responsibility": [
    "Take ownership of one mistake you made",
    "Follow through completely on a commitment",
    "Be accountable for your actions today"
  ]
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
  window.dispatchEvent(new Event("dareu:progress-update"));
}

export default function Challenges() {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // קריאת הנושאים שהמשתמש בחר בשאלון
    if (window.surveyAnswers && window.surveyAnswers.selectedTopics) {
      setSelectedTopics(window.surveyAnswers.selectedTopics);
    } else {
      // אם אין נתוני שאלון, השתמש בנושאים דיפולטיביים
      setSelectedTopics(["Building Self-Confidence", "Learning & Growth", "Personal Goals"]);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="ch-page">
        <h1 className="ch-title">Loading Your Challenges...</h1>
      </div>
    );
  }

  return (
    <div className="ch-page">
      <h1 className="ch-title">Your Personal Challenges</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
        Based on your selected topics: <strong>{selectedTopics.join(", ")}</strong>
      </p>
      
      {selectedTopics.map((topic) => (
        <Section 
          key={topic} 
          name={topic} 
          challenges={CHALLENGES_BY_TOPIC[topic] || [`Challenge for ${topic}`, `Another challenge for ${topic}`]} 
        />
      ))}
    </div>
  );
}

function Section({ name, challenges }) {
  const [items, setItems] = useState(
    () => challenges.map((title, i) => ({ 
      id: `${name.replace(/[^a-zA-Z0-9]/g, '')}-${i}`, 
      title 
    }))
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
            category={name.toLowerCase().replace(/[^a-z]/g, '')} // המרה לקטגוריה לשמירה
            onRemove={remove}
          />
        ))}
      </ul>
    </section>
  );
}

function ChallengeRow({ id, title, category, onRemove }) {
  const [status, setStatus] = useState("idle");

  const onMainClick = () => {
    if (status === "idle" || status === "later") {
      setStatus("success");
    } else if (status === "success") {
      try {
        // עדכון נקודות ורמה
        const meta = readMeta();
        const newPoints = meta.points + 10;
        writeMeta(newPoints);

        // עדכון התקדמות לפי קטגוריה
        const data = JSON.parse(localStorage.getItem(PROG_KEY) || "{}");
        const curr = Number(data[category] || 0);
        data[category] = curr + 1;
        localStorage.setItem(PROG_KEY, JSON.stringify(data));
        
        // שליחת אירוע לעדכון דפים אחרים
        window.dispatchEvent(new Event("dareu:progress-update"));
      } catch (error) {
        console.error("Error updating progress:", error);
      }
      onRemove(id);
    }
  };

  const onLaterClick = () => {
    setStatus("later");
    onRemove(id);
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