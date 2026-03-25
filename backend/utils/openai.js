import axios from "axios";

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

// External AI call. No training in the app; we use system prompt + constraints.
export async function generateGymAssistantReply({ messages, model, temperature }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const payload = {
    model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    temperature: typeof temperature === "number" ? temperature : 0.3,
    max_tokens: 350,
  };

  const res = await axios.post(OPENAI_CHAT_COMPLETIONS_URL, payload, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 60000,
  });

  return res.data?.choices?.[0]?.message?.content || "";
}

