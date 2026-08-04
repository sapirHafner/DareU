import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "Think of something you were afraid to do in the past – what helped you do it anyway?",
    options: [
      "Someone encouraged me",
      "I knew it was important to me",
      "I got feedback or a reward",
      "I didn’t want to lose to others",
      "I told myself 'let’s just try something small'"
    ],
  },
  {
    question: "What gets you to take action even when it feels uncomfortable?",
    options: [
      "Having a clear goal",
      "Seeing someone else succeed",
      "Knowing there’s a reward or result",
      "Being part of a group",
      "Curiosity – wanting to see what happens"
    ],
  },
  {
    question: "What helps you feel safe when trying something new?",
    options: [
      "Doing it with someone",
      "Knowing why it matters to me",
      "Having a clear plan and small first step",
      "Getting positive feedback",
      "Not feeling like I’ll be the worst at it"
    ],
  },
  {
    question: "What would make you say 'OK, I’m doing this'?",
    options: [
      "A challenge or competition",
      "Someone I admire believes in me",
      "I know it’s a step forward in my life",
      "A prize or recognition",
      "It feels less scary than I thought"
    ],
  },
  {
    question: "What frustrates you most when trying something new?",
    options: [
      "No one supports me",
      "I don’t know why I’m doing it",
      "No immediate results",
      "I’m doing it alone",
      "It’s too big and unclear where to start"
    ],
  },
];

export default function Topics() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  const handleAnswer = (answer) => {
    const updated = [...answers, answer];
    setAnswers(updated);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      localStorage.setItem("surveyAnswers", JSON.stringify(updated));
      navigate("/home");
    }
  };

  const current = questions[step];

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h2>Step 1: Motivation Survey</h2>
      <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>{current.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {current.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#f0f0f0",
              cursor: "pointer",
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
