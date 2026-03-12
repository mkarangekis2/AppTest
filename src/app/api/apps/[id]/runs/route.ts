import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getPrimaryCompany } from "@/lib/acg/company";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const company = await getPrimaryCompany(supabase as any, user.id);
  if (!company) {
    return jsonError("No company profile found. Complete onboarding first.", 404);
  }

  const { data, error } = await supabase
    .from("ai_app_runs")
    .select("id,status,input_json,output_json,error_text,latency_ms,started_at,finished_at")
    .eq("company_id", company.id)
    .eq("app_id", params.id)
    .order("started_at", { ascending: false })
    .limit(20);

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ runs: data || [] });
}
