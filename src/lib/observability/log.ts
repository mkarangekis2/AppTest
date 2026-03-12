type LogPayload = {
  level: "info" | "error";
  event: string;
  context?: Record<string, unknown>;
};

function redactContext(context: Record<string, unknown> | undefined) {
  if (!context) return undefined;
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (/key|token|secret|password/i.test(key)) {
      redacted[key] = "[redacted]";
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export function logInfo(event: string, context?: Record<string, unknown>) {
  const payload: LogPayload = { level: "info", event, context: redactContext(context) };
  console.info(JSON.stringify(payload));
}

export function logError(event: string, context?: Record<string, unknown>) {
  const payload: LogPayload = { level: "error", event, context: redactContext(context) };
  console.error(JSON.stringify(payload));
}
