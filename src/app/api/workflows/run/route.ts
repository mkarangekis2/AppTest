import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const body = await parseJsonBody<{ workflowId?: string; input?: Record<string, unknown> }>(request);
  if (!body.workflowId) return jsonError("workflowId is required.");

  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("id,name,trigger_type,status")
    .eq("id", body.workflowId)
    .eq("company_id", context.company.id)
    .maybeSingle();

  if (workflowError || !workflow) {
    return jsonError(workflowError?.message || "Workflow not found.", 404);
  }

  const now = new Date();
  const startedAt = now.toISOString();
  const finishedAt = new Date(now.getTime() + 450).toISOString();

  const output = {
    message: `Workflow "${workflow.name}" executed.`,
    trigger_type: workflow.trigger_type,
    simulated: true
  };

  const { data: run, error: runError } = await supabase
    .from("workflow_runs")
    .insert({
      workflow_id: workflow.id,
      company_id: context.company.id,
      status: "completed",
      input_json: body.input || {},
      output_json: output,
      started_at: startedAt,
      finished_at: finishedAt
    })
    .select("id,workflow_id,status,started_at,finished_at,output_json")
    .single();

  if (runError) return jsonError(runError.message, 500);
  return Response.json({ run });
}
