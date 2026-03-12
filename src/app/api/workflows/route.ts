import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const { data, error } = await supabase
    .from("workflows")
    .select("id,name,status,trigger_type,version,created_at,updated_at")
    .eq("company_id", context.company.id)
    .order("updated_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return Response.json({ workflows: data || [] });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const body = await parseJsonBody<{
    name?: string;
    triggerType?: string;
    status?: string;
    definition?: Record<string, unknown>;
  }>(request);

  if (!body.name?.trim() || !body.triggerType?.trim()) {
    return jsonError("name and triggerType are required.");
  }

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      company_id: context.company.id,
      name: body.name.trim(),
      trigger_type: body.triggerType.trim(),
      status: body.status?.trim() || "draft",
      definition_json: body.definition || {}
    })
    .select("id,name,status,trigger_type,version,created_at")
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ workflow: data });
}
