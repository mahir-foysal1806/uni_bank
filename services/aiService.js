const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

async function chatWithAI(message) {
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `
You are UniQBank AI, an academic assistant for university students.

Help students with:
- Programming
- Computer Science
- Mathematics
- Database
- Study planning
- University academic topics

Rules:
- Answer clearly and concisely.
- If the user writes Bangla or Banglish, answer in natural Bangla.
- If the user writes English, answer in English.
- Use examples when helpful.
- Do not invent facts.

Student message:
${message.trim()}
`;

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      `Gemini API request failed with status ${response.status}`
    );
  }

  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response");
  }

  return reply;
}

module.exports = {
  chatWithAI,
};