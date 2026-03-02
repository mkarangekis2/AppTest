import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { scoreSession } from "@/lib/scoring";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;

  const [{ data: session }, { data: events }] = await Promise.all([
    supabase.from("sessions").select("*, scenarios(rubric_json)").eq("id", params.id).maybeSingle(),
    supabase.from("events").select("*").eq("session_id", params.id).order("ts", { ascending: true })
  ]);

  if (!session) {
    return jsonError("Session not found.", 404);
  }

  const endedAt = new Date().toISOString();
  const score = scoreSession(
    events || [],
    session.scenarios?.rubric_json as {
      critical_actions: Array<{ action: string; must_occur_by_sec: number; fail_if_missed: boolean; notes: string }>;
      scoring_dimensions: Array<{ name: "sequence" | "speed" | "accuracy" | "reassessment"; max_points: number; notes: string }>;
    },
    session.started_at
  );

  const [{ error: sessionError }, { error: scoreError }, { error: eventError }] = await Promise.all([
    supabase.from("sessions").update({ ended_at: endedAt }).eq("id", params.id),
    supabase.from("scores").upsert({
      session_id: params.id,
      rubric_version: "2026-03-02.1",
      score_json: score,
      final_by: user.id,
      final_at: endedAt
    }, { onConflict: "session_id" }),
    supabase.from("events").insert({
      session_id: params.id,
      type: "note",
      payload_json: { message: "Session ended and AAR generated." }
    })
  ]);

  if (sessionError || scoreError || eventError) {
    return jsonError(sessionError?.message || scoreError?.message || eventError?.message || "Failed to end session.", 500);
  }

  return Response.json({ ok: true });
}
