type AiProvider = "openai" | "anthropic";

export type CreateAiAppInput = {
  name: string;
  description?: string;
  provider: AiProvider;
  model: string;
  systemPrompt: string;
  inputSchemaJson?: unknown;
  outputSchemaJson?: unknown;
};

export type AppRunInput = {
  userPrompt: string;
  context?: Record<string, unknown>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function slugifyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function validateCreateAiAppInput(value: unknown): { valid: true; data: CreateAiAppInput } | { valid: false; error: string } {
  if (!isObject(value)) {
    return { valid: false, error: "Invalid payload." };
  }
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const provider = value.provider;
  const model = typeof value.model === "string" ? value.model.trim() : "";
  const systemPrompt = typeof value.systemPrompt === "string" ? value.systemPrompt.trim() : "";

  if (!name) {
    return { valid: false, error: "name is required." };
  }
  if (provider !== "openai" && provider !== "anthropic") {
    return { valid: false, error: "provider must be openai or anthropic." };
  }
  if (!model) {
    return { valid: false, error: "model is required." };
  }
  if (!systemPrompt) {
    return { valid: false, error: "systemPrompt is required." };
  }

  return {
    valid: true,
    data: {
      name,
      description: typeof value.description === "string" ? value.description.trim() : "",
      provider,
      model,
      systemPrompt,
      inputSchemaJson: isObject(value.inputSchemaJson) ? value.inputSchemaJson : {},
      outputSchemaJson: isObject(value.outputSchemaJson) ? value.outputSchemaJson : {}
    }
  };
}

export function validateAppRunInput(value: unknown): { valid: true; data: AppRunInput } | { valid: false; error: string } {
  if (!isObject(value)) {
    return { valid: false, error: "Invalid payload." };
  }
  const userPrompt = typeof value.userPrompt === "string" ? value.userPrompt.trim() : "";
  if (!userPrompt) {
    return { valid: false, error: "userPrompt is required." };
  }

  return {
    valid: true,
    data: {
      userPrompt,
      context: isObject(value.context) ? value.context : {}
    }
  };
}

async function runOpenAi({
  model,
  systemPrompt,
  userPrompt,
  context,
  timeoutMs
}: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  context: Record<string, unknown>;
  timeoutMs: number;
}) {
  if (!process.env.OPENAI_API_KEY) {
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
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\n\nReturn valid JSON only.`
          },
          {
            role: "user",
            content: JSON.stringify({ userPrompt, context })
          }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed (${response.status}).`);
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }
    return safeParseJson(content);
  } finally {
    clearTimeout(timer);
  }
}

async function runAnthropic({
  model,
  systemPrompt,
  userPrompt,
  context,
  timeoutMs
}: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  context: Record<string, unknown>;
  timeoutMs: number;
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: `${systemPrompt}\n\nReturn valid JSON only.`,
        messages: [{ role: "user", content: JSON.stringify({ userPrompt, context }) }]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Anthropic request failed (${response.status}).`);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };

    const content = payload.content?.find((part) => part.type === "text")?.text?.trim();
    if (!content) {
      throw new Error("Anthropic returned empty content.");
    }
    return safeParseJson(content);
  } finally {
    clearTimeout(timer);
  }
}

function safeParseJson(content: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(content);
    if (isObject(parsed)) {
      return parsed;
    }
    return { result: parsed };
  } catch {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      const parsed = JSON.parse(fenced[1]);
      if (isObject(parsed)) {
        return parsed;
      }
      return { result: parsed };
    }
    return { result_text: content };
  }
}

export async function runAiApp({
  provider,
  model,
  systemPrompt,
  userPrompt,
  context,
  timeoutMs = 30000
}: {
  provider: AiProvider;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  context: Record<string, unknown>;
  timeoutMs?: number;
}) {
  if (provider === "openai") {
    return runOpenAi({ model, systemPrompt, userPrompt, context, timeoutMs });
  }
  return runAnthropic({ model, systemPrompt, userPrompt, context, timeoutMs });
}
