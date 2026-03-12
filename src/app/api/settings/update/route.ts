import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { canManageSettings, getUserRole } from "@/lib/permissions/rbac";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const role = getUserRole(user as any);
  if (!canManageSettings(role)) return jsonError("Forbidden.", 403);
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const body = await parseJsonBody<{
    companyName?: string;
    website?: string;
    brandVoice?: Record<string, unknown>;
    aiBehavior?: Record<string, unknown>;
    notifications?: Record<string, unknown>;
  }>(request);

  if (body.companyName || body.website !== undefined) {
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name: body.companyName?.trim() || context.company.name,
        website: body.website?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", context.company.id);
    if (companyError) return jsonError(companyError.message, 500);
  }

  const { error: settingsError } = await supabase.from("company_settings").upsert(
    {
      company_id: context.company.id,
      brand_voice_json: body.brandVoice || {},
      ai_behavior_json: body.aiBehavior || {},
      notifications_json: body.notifications || {},
      updated_at: new Date().toISOString()
    },
    { onConflict: "company_id" }
  );
  if (settingsError) return jsonError(settingsError.message, 500);

  return Response.json({ ok: true });
}
