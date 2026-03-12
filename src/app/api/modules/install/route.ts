import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { ensureCatalogSeeded } from "@/lib/acg/catalog-sync";
import { installModuleWithDefaults } from "@/lib/acg/install";
import { canInstallMoreModules } from "@/lib/billing/entitlements";
import { canInstallSystems, getUserRole } from "@/lib/permissions/rbac";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const role = getUserRole(user as any);
  if (!canInstallSystems(role)) {
    return jsonError("Forbidden.", 403);
  }
  const body = await parseJsonBody<{ slug?: string; config?: Record<string, unknown> }>(request);
  if (!body.slug) {
    return jsonError("Module slug is required.");
  }

  try {
    await ensureCatalogSeeded();
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Catalog sync failed.", 500);
  }

  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) {
    return jsonError("No company profile found. Complete onboarding first.", 404);
  }

  const entitlement = await canInstallMoreModules(supabase as any, context.company.id);
  if (!entitlement.allowed) {
    return jsonError(
      `Module limit reached for ${entitlement.plan} plan (${entitlement.installedCount}/${entitlement.maxModules}).`,
      403
    );
  }

  try {
    const installed = await installModuleWithDefaults(supabase as any, context.company.id, body.slug, body.config || {});
    return Response.json({ ok: true, module: installed.moduleRow, workflowsInitialized: installed.workflowCount });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Module install failed.", 500);
  }
}
