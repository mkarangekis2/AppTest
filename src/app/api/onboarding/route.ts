import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { normalizeOnboardingPayload } from "@/lib/acg/validation";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const body = await parseJsonBody<unknown>(request);
  const payload = normalizeOnboardingPayload(body);

  if (!payload) {
    return jsonError("Invalid onboarding payload.");
  }

  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let companyId = existingCompany?.id;

  if (!companyId) {
    const { data: insertedCompany, error: insertCompanyError } = await supabase
      .from("companies")
      .insert({
        name: payload.companyName,
        website: payload.website || null,
        industry: payload.industry,
        team_size: payload.teamSize,
        revenue_model: payload.revenueModel,
        created_by: user.id
      })
      .select("id")
      .single();

    if (insertCompanyError || !insertedCompany) {
      return jsonError(insertCompanyError?.message || "Failed to create company.", 500);
    }
    companyId = insertedCompany.id;
  } else {
    const { error: updateCompanyError } = await supabase
      .from("companies")
      .update({
        name: payload.companyName,
        website: payload.website || null,
        industry: payload.industry,
        team_size: payload.teamSize,
        revenue_model: payload.revenueModel,
        updated_at: new Date().toISOString()
      })
      .eq("id", companyId);

    if (updateCompanyError) {
      return jsonError(updateCompanyError.message, 500);
    }
  }

  const { error: profileError } = await supabase
    .from("company_profiles")
    .upsert(
      {
        company_id: companyId,
        lead_volume: payload.leadVolume,
        support_volume: payload.supportVolume,
        documentation_maturity: payload.documentationMaturity,
        workflow_maturity: payload.workflowMaturity,
        project_complexity: payload.projectComplexity,
        support_complexity: payload.supportComplexity,
        top_pain_points_json: payload.painPoints,
        growth_goals_json: payload.growthGoals,
        updated_at: new Date().toISOString()
      },
      { onConflict: "company_id" }
    );

  if (profileError) {
    return jsonError(profileError.message, 500);
  }

  const { error: deleteAnswersError } = await supabase.from("onboarding_answers").delete().eq("company_id", companyId);
  if (deleteAnswersError) {
    return jsonError(deleteAnswersError.message, 500);
  }

  if (payload.answers.length) {
    const { error: answerInsertError } = await supabase.from("onboarding_answers").insert(
      payload.answers.map((answer) => ({
        company_id: companyId,
        question_key: answer.questionKey,
        answer_json: answer.answer,
        created_by: user.id
      }))
    );
    if (answerInsertError) {
      return jsonError(answerInsertError.message, 500);
    }
  }

  return Response.json({ ok: true, companyId });
}
