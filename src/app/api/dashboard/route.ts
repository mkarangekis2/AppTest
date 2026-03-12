import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const [leadsResult, oppsResult, clientsResult, runsResult] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("company_id", context.company.id),
    supabase.from("opportunities").select("value,risk_level").eq("company_id", context.company.id),
    supabase.from("clients").select("id,churn_risk").eq("company_id", context.company.id),
    supabase.from("workflow_runs").select("id,status").eq("company_id", context.company.id).limit(200)
  ]);

  if (leadsResult.error) return jsonError(leadsResult.error.message, 500);
  if (oppsResult.error) return jsonError(oppsResult.error.message, 500);
  if (clientsResult.error) return jsonError(clientsResult.error.message, 500);
  if (runsResult.error) return jsonError(runsResult.error.message, 500);

  const totalPipelineValue = (oppsResult.data || []).reduce((sum, item) => sum + Number(item.value || 0), 0);
  const atRiskOpps = (oppsResult.data || []).filter((item) => item.risk_level === "high").length;
  const churnRiskClients = (clientsResult.data || []).filter((item) => item.churn_risk === "high").length;
  const totalRuns = (runsResult.data || []).length;
  const successfulRuns = (runsResult.data || []).filter((run) => run.status === "completed").length;
  const workflowSuccessRate = totalRuns ? Math.round((successfulRuns / totalRuns) * 100) : 0;

  return Response.json({
    kpis: {
      leadCount: leadsResult.count || 0,
      totalPipelineValue,
      atRiskOpps,
      clientCount: (clientsResult.data || []).length,
      churnRiskClients,
      workflowSuccessRate
    }
  });
}
