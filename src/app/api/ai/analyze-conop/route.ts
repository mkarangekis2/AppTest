import { requireApiUser } from "@/lib/auth";
import { fallbackConopAnalysis } from "@/lib/ai/fallbacks";
import { buildConopAnalysisPrompt, PROMPT_VERSION } from "@/lib/ai/prompts";
import { requestStructuredJson } from "@/lib/ai/openai";
import { validateConopAnalysisOutput } from "@/lib/ai/validation";
import { sha256 } from "@/lib/hash";
import { parseJsonBody, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase } = auth;
  const body = await parseJsonBody<{ conopId?: string }>(request);

  if (!body.conopId) {
    return jsonError("conopId is required.");
  }

  const { data: conop, error } = await supabase
    .from("conops")
    .select(
      "id,title,raw_text,metadata_json,conop_hash,analysis_cache_json,analysis_cache_model,analysis_cache_prompt_version"
    )
    .eq("id", body.conopId)
    .maybeSingle();

  if (error || !conop) {
    return jsonError(error?.message || "CONOP not found.", 404);
  }

  const prompt = buildConopAnalysisPrompt({
    title: conop.title,
    rawText: conop.raw_text,
    metadata: {
      ...(conop.metadata_json as Record<string, unknown>),
      prompt_version: PROMPT_VERSION
    }
  });
  const cacheHash = sha256(JSON.stringify({ title: conop.title, rawText: conop.raw_text, metadata: conop.metadata_json || {} }));

  if (
    conop.conop_hash === cacheHash &&
    conop.analysis_cache_json &&
    conop.analysis_cache_prompt_version === PROMPT_VERSION &&
    conop.analysis_cache_model === (process.env.OPENAI_MODEL || "gpt-4.1-mini")
  ) {
    return Response.json(conop.analysis_cache_json);
  }

  try {
    const payload = await requestStructuredJson(prompt);
    if (!validateConopAnalysisOutput(payload)) {
      return jsonError("AI response did not match CONOP_ANALYSIS_OUTPUT.", 502);
    }
    await supabase
      .from("conops")
      .update({
        conop_hash: cacheHash,
        analysis_cache_json: payload,
        analysis_cache_model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        analysis_cache_prompt_version: PROMPT_VERSION,
        analysis_generated_at: new Date().toISOString()
      })
      .eq("id", conop.id);
    return Response.json(payload);
  } catch {
    const fallback = fallbackConopAnalysis(conop.title, conop.raw_text);
    await supabase
      .from("conops")
      .update({
        conop_hash: cacheHash,
        analysis_cache_json: fallback,
        analysis_cache_model: process.env.OPENAI_MODEL || "fallback",
        analysis_cache_prompt_version: PROMPT_VERSION,
        analysis_generated_at: new Date().toISOString()
      })
      .eq("id", conop.id);
    return Response.json(fallback);
  }
}
