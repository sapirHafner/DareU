const OpenAI = require("openai");
require("dotenv").config();

(async () => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const r = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: "ping" }],
  });
  console.log(r.choices[0].message);
})();
