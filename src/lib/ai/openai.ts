import { hasOpenAi } from "@/lib/env";

type OpenAiJsonRequest = {
  system: string;
  user: string;
  timeoutMs?: number;
};

export async function requestStructuredJson({ system, user, timeoutMs = 20000 }: OpenAiJsonRequest) {
  if (!hasOpenAi()) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${text}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    return JSON.parse(content) as unknown;
  } finally {
    clearTimeout(timer);
  }
}
