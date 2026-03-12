import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { ensureCatalogSeeded } from "@/lib/acg/catalog-sync";
import { installPackageWithDefaults } from "@/lib/acg/install";
import { canInstallMoreModules } from "@/lib/billing/entitlements";
import { PACKAGE_CATALOG } from "@/config/packages";
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
  const body = await parseJsonBody<{ slug?: string }>(request);
  if (!body.slug) {
    return jsonError("Package slug is required.");
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

  const packageDef = PACKAGE_CATALOG.find((item) => item.slug === body.slug);
  if (!packageDef) {
    return jsonError("Package not found in catalog.", 404);
  }

  const entitlement = await canInstallMoreModules(supabase as any, context.company.id);
  const remaining = entitlement.maxModules - entitlement.installedCount;
  if (packageDef.includedModuleSlugs.length > remaining) {
    return jsonError(
      `Package requires ${packageDef.includedModuleSlugs.length} module slots but only ${remaining} remain on ${entitlement.plan} plan.`,
      403
    );
  }

  try {
    const installed = await installPackageWithDefaults(supabase as any, context.company.id, body.slug);
    return Response.json({
      ok: true,
      package: installed.packageRow,
      installedModules: installed.installedModules,
      workflowsInitialized: installed.workflowCount
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Package install failed.", 500);
  }
}
