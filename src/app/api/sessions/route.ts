import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const body = await parseJsonBody<{ scenarioId?: string; mode?: "exam" | "training" }>(request);

  if (!body.scenarioId || !body.mode) {
    return jsonError("scenarioId and mode are required.");
  }

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id,status,vitals_model_json")
    .eq("id", body.scenarioId)
    .maybeSingle();

  if (scenarioError || !scenario) {
    return jsonError(scenarioError?.message || "Scenario not found.", 404);
  }

  if (scenario.status !== "approved") {
    return jsonError("Only approved scenarios can start sessions.", 409);
  }

  const vitalsModel = scenario.vitals_model_json as { stage: string; baseline: Record<string, unknown> };
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      scenario_id: body.scenarioId,
      instructor_id: user.id,
      mode: body.mode,
      current_stage: vitalsModel.stage,
      current_vitals_json: vitalsModel.baseline
    })
    .select("id")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  await supabase.from("events").insert({
    session_id: data.id,
    type: "note",
    payload_json: { message: "Session started." }
  });

  return Response.json({ sessionId: data.id });
}
