import { PLAN_ENTITLEMENTS, PlanName } from "@/config/plans";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string, options?: Record<string, unknown>) => any;
    eq: (column: string, value: unknown) => any;
    maybeSingle: () => Promise<{ data: any; error: { message: string } | null }>;
  };
};

export async function getCompanyEntitlements(supabase: SupabaseLike, companyId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_name,status")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error || !data || data.status !== "active") {
    return { plan: "Starter" as PlanName, limits: PLAN_ENTITLEMENTS.Starter };
  }

  const planName = (data.plan_name as PlanName) in PLAN_ENTITLEMENTS ? (data.plan_name as PlanName) : "Starter";
  return { plan: planName, limits: PLAN_ENTITLEMENTS[planName] };
}

export async function canInstallMoreModules(supabase: SupabaseLike, companyId: string) {
  const { limits, plan } = await getCompanyEntitlements(supabase, companyId);
  const { count } = await supabase
    .from("module_installations")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  const installedCount = Number(count || 0);
  return {
    allowed: installedCount < limits.maxModules,
    installedCount,
    maxModules: limits.maxModules,
    plan
  };
}
