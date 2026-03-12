import { requireApiUser } from "@/lib/auth";
import { jsonError, parseJsonBody } from "@/lib/http";
import { getPrimaryCompany } from "@/lib/acg/company";
import { getUserRole } from "@/lib/permissions/rbac";
import { runAiApp, validateAppRunInput } from "@/lib/ai/apps";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const role = getUserRole(auth.user as any);
  if (role === "Viewer") {
    return jsonError("Forbidden.", 403);
  }

  const body = await parseJsonBody<unknown>(request);
  const validated = validateAppRunInput(body);
  if (!validated.valid) {
    return jsonError(validated.error);
  }

  const { supabase, user } = auth;
  const company = await getPrimaryCompany(supabase as any, user.id);
  if (!company) {
    return jsonError("No company profile found. Complete onboarding first.", 404);
  }

  const { data: app, error: appError } = await supabase
    .from("ai_apps")
    .select("id,name,provider,model,system_prompt,is_active")
    .eq("id", params.id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (appError || !app) {
    return jsonError(appError?.message || "AI app not found.", 404);
  }
  if (!app.is_active) {
    return jsonError("AI app is inactive.", 409);
  }

  const startedAt = new Date();
  const { data: runRow, error: runInsertError } = await supabase
    .from("ai_app_runs")
    .insert({
      app_id: app.id,
      company_id: company.id,
      created_by: user.id,
      status: "pending",
      input_json: {
        prompt: validated.data.userPrompt,
        context: validated.data.context
      },
      started_at: startedAt.toISOString()
    })
    .select("id")
    .maybeSingle();

  if (runInsertError || !runRow) {
    return jsonError(runInsertError?.message || "Failed to create app run.", 500);
  }

  try {
    const output = await runAiApp({
      provider: app.provider as "openai" | "anthropic",
      model: app.model,
      systemPrompt: app.system_prompt,
      userPrompt: validated.data.userPrompt,
      context: validated.data.context || {}
    });

    const finishedAt = new Date();
    const latencyMs = finishedAt.getTime() - startedAt.getTime();

    const { error: runUpdateError } = await supabase
      .from("ai_app_runs")
      .update({
        status: "success",
        output_json: output,
        latency_ms: latencyMs,
        finished_at: finishedAt.toISOString()
      })
      .eq("id", runRow.id);

    if (runUpdateError) {
      return jsonError(runUpdateError.message, 500);
    }

    return Response.json({
      runId: runRow.id,
      status: "success",
      output,
      latencyMs
    });
  } catch (error) {
    const finishedAt = new Date();
    const latencyMs = finishedAt.getTime() - startedAt.getTime();
    const message = error instanceof Error ? error.message : "AI app execution failed.";

    await supabase
      .from("ai_app_runs")
      .update({
        status: "error",
        error_text: message,
        latency_ms: latencyMs,
        finished_at: finishedAt.toISOString()
      })
      .eq("id", runRow.id);

    return jsonError(message, 500);
  }
}
