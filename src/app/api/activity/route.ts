import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const { data, error } = await supabase
    .from("workflow_runs")
    .select("id,workflow_id,status,input_json,output_json,error_message,started_at,finished_at")
    .eq("company_id", context.company.id)
    .order("started_at", { ascending: false })
    .limit(50);

  if (error) return jsonError(error.message, 500);
  return Response.json({ activity: data || [] });
}
