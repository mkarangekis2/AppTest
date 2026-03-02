import { requireApiUser } from "@/lib/auth";
import { LiveSuggestionOutput, Vitals } from "@/lib/domain";
import { parseJsonBody, jsonError } from "@/lib/http";
import { applyVitalsDelta } from "@/lib/session-state";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase } = auth;
  const suggestion = await parseJsonBody<LiveSuggestionOutput>(request);

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id,current_vitals_json")
    .eq("id", params.id)
    .maybeSingle();

  if (sessionError || !session) {
    return jsonError(sessionError?.message || "Session not found.", 404);
  }

  const nextVitals = applyVitalsDelta(session.current_vitals_json as Vitals, suggestion.suggested_state_transition.vitals_delta);

  const { error } = await supabase
    .from("sessions")
    .update({
      current_stage: suggestion.suggested_state_transition.to_stage,
      current_vitals_json: nextVitals
    })
    .eq("id", params.id);

  if (error) {
    return jsonError(error.message, 500);
  }

  await supabase.from("events").insert([
    {
      session_id: params.id,
      type: "proctor_apply",
      payload_json: { suggestion }
    },
    {
      session_id: params.id,
      type: "patient_change",
      payload_json: {
        stage: suggestion.suggested_state_transition.to_stage,
        vitals: nextVitals,
        reason: suggestion.suggested_state_transition.reason
      }
    }
  ]);

  return Response.json({ ok: true });
}
