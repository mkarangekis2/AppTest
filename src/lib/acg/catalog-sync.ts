import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { MODULE_CATALOG } from "@/config/modules";
import { PACKAGE_CATALOG } from "@/config/packages";

export async function ensureCatalogSeeded() {
  const service = createSupabaseServiceClient();

  const moduleRows = MODULE_CATALOG.map((item) => ({
    slug: item.slug,
    name: item.name,
    category: item.category,
    description: item.description,
    problem_solved: item.problemSolved,
    expected_outcomes_json: item.expectedOutcomes,
    config_json: {
      complexity: item.complexity,
      setup_estimate: item.setupEstimate
    },
    required_integrations_json: item.requiredIntegrations,
    updated_at: new Date().toISOString()
  }));

  const { error: moduleError } = await service.from("modules").upsert(moduleRows, { onConflict: "slug" });
  if (moduleError) {
    throw new Error(`Module catalog sync failed: ${moduleError.message}`);
  }

  const { data: modules, error: fetchModulesError } = await service.from("modules").select("id,slug");
  if (fetchModulesError) {
    throw new Error(`Module catalog read failed: ${fetchModulesError.message}`);
  }

  const moduleIdBySlug = new Map<string, string>();
  for (const row of modules || []) {
    moduleIdBySlug.set(row.slug, row.id);
  }

  const packageRows = PACKAGE_CATALOG.map((item) => ({
    slug: item.slug,
    name: item.name,
    category: item.category,
    description: item.description,
    included_module_ids_json: item.includedModuleSlugs
      .map((slug) => moduleIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id)),
    config_json: {
      setup_estimate: item.setupEstimate
    },
    updated_at: new Date().toISOString()
  }));

  const { error: packageError } = await service.from("packages").upsert(packageRows, { onConflict: "slug" });
  if (packageError) {
    throw new Error(`Package catalog sync failed: ${packageError.message}`);
  }
}
