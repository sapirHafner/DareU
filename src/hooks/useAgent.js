import { useCallback, useState } from "react";

const AGENT_API_ENDPOINT = "/api/agent/generate";
const DEFAULT_QUESTION_COUNT = 8;

function createMockQuestions({ topics = [], count = DEFAULT_QUESTION_COUNT }) {
  const topicLabel = topics[0] || "your goal";

  return Array.from({ length: count }, (_, index) => ({
    id: `q_${Date.now()}_${index}`,
    text: `Mock Q${index + 1}: take a small step toward ${topicLabel}`,
    type: "choice4",
    options: [
      { key: "a", label: "Create a simple first step" },
      { key: "b", label: "Ask someone to support you" },
      { key: "c", label: "Turn it into a mini challenge" },
      { key: "d", label: "Reward yourself for the effort" },
    ],
    difficulty: "easy",
    tag: "mock",
  }));
}

export async function generateQuestions({ answers = {}, profileHint = "", topics = [], count = DEFAULT_QUESTION_COUNT, level = "mix" } = {}) {
  const response = await fetch(AGENT_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, profileHint, topics, count, level }),
  });

  if (!response.ok) {
    throw new Error(`Agent API request failed with status ${response.status}`);
  }

  return response.json();
}

export function generateMockQuestions({ answers = {}, topics = [], count = DEFAULT_QUESTION_COUNT, delayMs = 700 } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        questions: createMockQuestions({ topics, count }),
        rationale: "Local mock data",
        basedOn: answers,
      });
    }, delayMs);
  });
}

export function useAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const requestQuestions = useCallback(async (options) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await generateQuestions(options);
      setResult(data);
      return data;
    } catch (fetchError) {
      setError(fetchError);
      const mockData = await generateMockQuestions(options);
      setResult(mockData);
      return mockData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    result,
    requestQuestions,
    generateQuestions,
    generateMockQuestions,
  };
}
