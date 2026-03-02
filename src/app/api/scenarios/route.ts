import { requireApiUser } from "@/lib/auth";
import { ConopAnalysisOutput } from "@/lib/domain";
import { sha256 } from "@/lib/hash";
import { parseJsonBody, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const body = await parseJsonBody<{
    conopId?: string;
    analysis?: ConopAnalysisOutput;
    candidateIndex?: number;
  }>(request);

  if (!body.conopId || !body.analysis || typeof body.candidateIndex !== "number") {
    return jsonError("conopId, analysis, and candidateIndex are required.");
  }

  const candidate = body.analysis.scenario_candidates[body.candidateIndex];
  if (!candidate) {
    return jsonError("Invalid candidate index.");
  }

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      conop_id: body.conopId,
      name: candidate.scenario_name,
      status: "draft",
      moi: candidate.moi,
      difficulty: candidate.difficulty,
      environment_json: body.analysis.operational_context,
      rubric_json: candidate.rubric,
      wound_set_json: candidate.wound_set,
      presentation_script_json: candidate.patient_presentation,
      vitals_model_json: candidate.vitals_model,
      conop_hash: sha256(JSON.stringify({ conopId: body.conopId, analysis: body.analysis })),
      ai_model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      prompt_version: "2026-03-02.1",
      created_by: user.id
    })
    .select("id")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ scenarioId: data.id });
}
