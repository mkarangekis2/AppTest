import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;

  const { data: scenario, error: findError } = await supabase
    .from("scenarios")
    .select("id,status")
    .eq("id", params.id)
    .maybeSingle();

  if (findError || !scenario) {
    return jsonError(findError?.message || "Scenario not found.", 404);
  }

  if (scenario.status === "approved") {
    return Response.json({ ok: true });
  }

  const { error } = await supabase
    .from("scenarios")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString()
    })
    .eq("id", params.id);

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ ok: true });
}
