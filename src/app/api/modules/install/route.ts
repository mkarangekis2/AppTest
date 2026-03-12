import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const body = await parseJsonBody<{ slug?: string; config?: Record<string, unknown> }>(request);
  if (!body.slug) {
    return jsonError("Module slug is required.");
  }

  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) {
    return jsonError("No company profile found. Complete onboarding first.", 404);
  }

  const { data: moduleRow } = await supabase.from("modules").select("id,slug,name").eq("slug", body.slug).maybeSingle();
  if (!moduleRow) {
    return jsonError("Module not found in database catalog. Seed modules first.", 404);
  }

  const { error } = await supabase.from("module_installations").upsert(
    {
      company_id: context.company.id,
      module_id: moduleRow.id,
      status: "installed",
      config_json: body.config || {},
      updated_at: new Date().toISOString()
    },
    { onConflict: "company_id,module_id" }
  );

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ ok: true, module: moduleRow });
}
