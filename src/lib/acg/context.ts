import type { SupabaseClient } from "@supabase/supabase-js";
import { OnboardingPayload } from "@/lib/acg/types";

type DbClient = SupabaseClient<any, "public", any>;

export async function getLatestCompanyContext(supabase: DbClient, userId: string) {
  const { data: company } = await supabase
    .from("companies")
    .select("id,name,website,industry,team_size,revenue_model,created_at")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!company) {
    return null;
  }

  const [{ data: profile }, { data: answers }] = await Promise.all([
    supabase
      .from("company_profiles")
      .select(
        "lead_volume,support_volume,documentation_maturity,workflow_maturity,project_complexity,support_complexity,top_pain_points_json,growth_goals_json"
      )
      .eq("company_id", company.id)
      .maybeSingle(),
    supabase
      .from("onboarding_answers")
      .select("question_key,answer_json")
      .eq("company_id", company.id)
      .order("created_at", { ascending: true })
  ]);

  if (!profile) {
    return null;
  }

  const payload: OnboardingPayload = {
    companyName: company.name,
    website: company.website || "",
    industry: company.industry,
    teamSize: company.team_size,
    revenueModel: company.revenue_model,
    leadVolume: profile.lead_volume,
    supportVolume: profile.support_volume,
    documentationMaturity: profile.documentation_maturity,
    workflowMaturity: profile.workflow_maturity,
    projectComplexity: profile.project_complexity,
    supportComplexity: profile.support_complexity,
    painPoints: Array.isArray(profile.top_pain_points_json) ? (profile.top_pain_points_json as string[]) : [],
    growthGoals: Array.isArray(profile.growth_goals_json) ? (profile.growth_goals_json as string[]) : [],
    answers: (answers || []).map((item) => ({ questionKey: item.question_key, answer: item.answer_json }))
  };

  return { company, payload };
}
