import { requireApiUser } from "@/lib/auth";
import { fallbackLiveSuggestion } from "@/lib/ai/fallbacks";
import { buildLiveSuggestionPrompt } from "@/lib/ai/prompts";
import { requestStructuredJson } from "@/lib/ai/openai";
import { validateLiveSuggestionOutput } from "@/lib/ai/validation";
import { parseJsonBody, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase } = auth;
  const body = await parseJsonBody<{ sessionId?: string }>(request);

  if (!body.sessionId) {
    return jsonError("sessionId is required.");
  }

  const [{ data: session }, { data: events }] = await Promise.all([
    supabase.from("sessions").select("*, scenarios(*)").eq("id", body.sessionId).maybeSingle(),
    supabase.from("events").select("*").eq("session_id", body.sessionId).order("ts", { ascending: false }).limit(10)
  ]);

  if (!session) {
    return jsonError("Session not found.", 404);
  }

  const prompt = buildLiveSuggestionPrompt({
    current_stage: session.current_stage,
    current_vitals: session.current_vitals_json,
    scenario: session.scenarios,
    recent_events: events || []
  });

  try {
    const payload = await requestStructuredJson(prompt);
    if (!validateLiveSuggestionOutput(payload)) {
      return jsonError("AI response did not match LIVE_SUGGESTION_OUTPUT.", 502);
    }
    return Response.json(payload);
  } catch {
    return Response.json(fallbackLiveSuggestion(session.current_stage));
  }
}
