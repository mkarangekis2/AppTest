import { MODULE_CATALOG } from "@/config/modules";
import { PACKAGE_CATALOG } from "@/config/packages";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => any;
    eq: (column: string, value: unknown) => any;
    maybeSingle: () => Promise<{ data: any; error: { message: string } | null }>;
    upsert: (values: any, options?: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    insert: (values: any) => Promise<{ data?: any; error: { message: string } | null }>;
    in?: (column: string, values: unknown[]) => any;
  };
};

export async function installModuleWithDefaults(
  supabase: SupabaseLike,
  companyId: string,
  moduleSlug: string,
  config: Record<string, unknown> = {}
) {
  const moduleDef = MODULE_CATALOG.find((item) => item.slug === moduleSlug);
  if (!moduleDef) {
    throw new Error(`Module not found in catalog: ${moduleSlug}`);
  }

  const { data: moduleRow, error: moduleRowError } = await supabase
    .from("modules")
    .select("id,slug,name")
    .eq("slug", moduleSlug)
    .maybeSingle();
  if (moduleRowError || !moduleRow) {
    throw new Error(moduleRowError?.message || `Module row missing: ${moduleSlug}`);
  }

  const { error: installError } = await supabase.from("module_installations").upsert(
    {
      company_id: companyId,
      module_id: moduleRow.id,
      status: "installed",
      config_json: config,
      updated_at: new Date().toISOString()
    },
    { onConflict: "company_id,module_id" }
  );
  if (installError) {
    throw new Error(installError.message);
  }

  const workflowNames = moduleDef.defaultWorkflows;
  if (!workflowNames.length) {
    return { moduleRow, workflowCount: 0 };
  }

  const existingResponse = await supabase
    .from("workflows")
    .select("name")
    .eq("company_id", companyId)
    .eq("module_id", moduleRow.id);

  const existingNames = new Set<string>((existingResponse.data || []).map((item: { name: string }) => item.name));
  const toCreate = workflowNames.filter((name) => !existingNames.has(name));

  if (toCreate.length) {
    const { error: workflowError } = await supabase.from("workflows").insert(
      toCreate.map((name) => ({
        company_id: companyId,
        module_id: moduleRow.id,
        name,
        status: "draft",
        trigger_type: "ModuleInstalled",
        definition_json: {
          source: "module-default",
          module_slug: moduleDef.slug,
          trigger: "ModuleInstalled",
          conditions: [],
          actions: [{ type: "notify_user", target: "owner", message: `${name} initialized.` }]
        }
      }))
    );
    if (workflowError) {
      throw new Error(workflowError.message);
    }
  }

  return { moduleRow, workflowCount: toCreate.length };
}

export async function installPackageWithDefaults(supabase: SupabaseLike, companyId: string, packageSlug: string) {
  const packageDef = PACKAGE_CATALOG.find((item) => item.slug === packageSlug);
  if (!packageDef) {
    throw new Error(`Package not found in catalog: ${packageSlug}`);
  }

  const { data: packageRow, error: packageRowError } = await supabase
    .from("packages")
    .select("id,slug,name")
    .eq("slug", packageSlug)
    .maybeSingle();
  if (packageRowError || !packageRow) {
    throw new Error(packageRowError?.message || `Package row missing: ${packageSlug}`);
  }

  const { error: packageInstallError } = await supabase.from("package_installations").upsert(
    {
      company_id: companyId,
      package_id: packageRow.id,
      status: "installed",
      updated_at: new Date().toISOString()
    },
    { onConflict: "company_id,package_id" }
  );
  if (packageInstallError) {
    throw new Error(packageInstallError.message);
  }

  const installedModules: string[] = [];
  let workflowCount = 0;
  for (const moduleSlug of packageDef.includedModuleSlugs) {
    const installed = await installModuleWithDefaults(supabase, companyId, moduleSlug, { installed_via: packageSlug });
    installedModules.push(installed.moduleRow.slug);
    workflowCount += installed.workflowCount;
  }

  return { packageRow, installedModules, workflowCount };
}
