import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase } = auth;
  const body = await parseJsonBody<{ type?: string; payload?: Record<string, unknown> }>(request);

  if (!body.type || !body.payload) {
    return jsonError("type and payload are required.");
  }

  const { error } = await supabase.from("events").insert({
    session_id: params.id,
    type: body.type,
    payload_json: body.payload
  });

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ ok: true });
}
