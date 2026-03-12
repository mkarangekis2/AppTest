import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { logError, logInfo } from "@/lib/observability/log";
import { canManageIntegrations, getUserRole } from "@/lib/permissions/rbac";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const role = getUserRole(user as any);
  if (!canManageIntegrations(role)) return jsonError("Forbidden.", 403);
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const body = await parseJsonBody<{ provider?: string; config?: Record<string, unknown> }>(request);
  if (!body.provider?.trim()) return jsonError("provider is required.");

  const provider = body.provider.trim();
  const { error } = await supabase.from("integrations").upsert(
    {
      company_id: context.company.id,
      provider,
      status: "connected",
      config_json: body.config || {},
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "company_id,provider" }
  );

  if (error) {
    logError("integrations.connect_failed", { companyId: context.company.id, provider, message: error.message });
    return jsonError(error.message, 500);
  }

  logInfo("integrations.connected", { companyId: context.company.id, provider });
  return Response.json({ ok: true, provider });
}
