import { requireApiUser } from "@/lib/auth";
import { sha256 } from "@/lib/hash";
import { parseJsonBody, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const body = await parseJsonBody<{ title?: string; rawText?: string; metadata?: Record<string, unknown> }>(request);

  if (!body.title?.trim() || !body.rawText?.trim()) {
    return jsonError("Title and rawText are required.");
  }

  const { data, error } = await supabase
    .from("conops")
    .insert({
      title: body.title.trim(),
      raw_text: body.rawText.trim(),
      metadata_json: body.metadata || {},
      conop_hash: sha256(JSON.stringify({ title: body.title.trim(), rawText: body.rawText.trim(), metadata: body.metadata || {} })),
      created_by: user.id
    })
    .select("id,title,raw_text,metadata_json")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ conop: data });
}
