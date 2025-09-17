export async function generateQuestions({ answers, profileHint = "", topics = [], count = 8, level = "mix" }) {
  try {
    const res = await fetch("/api/agent/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, profileHint, topics, count, level }),
    });

    // אם אין שרת פעיל, נחזיר דמה מקומי
    if (!res.ok) throw new Error("Agent HTTP error");

    return await res.json(); // מצופה: { questions: [...], rationale: "..." }
  } catch (e) {
    // Fallback לפיתוח – לא עוצר אותך מלהמשיך ל-HomePage
    const mock = Array.from({ length: count }, (_, i) => ({
      id: `q_${Date.now()}_${i}`,
      text: `Mock Q${i + 1}: take a tiny step toward ${topics[0] || "your goal"}`,
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
    return { questions: mock, rationale: "Local mock (no API yet)" };
  }
}
