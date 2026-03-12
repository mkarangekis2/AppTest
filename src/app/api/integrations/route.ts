import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { logError, logInfo } from "@/lib/observability/log";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const { data, error } = await supabase
    .from("integrations")
    .select("id,provider,status,config_json,connected_at,updated_at")
    .eq("company_id", context.company.id)
    .order("updated_at", { ascending: false });

  if (error) {
    logError("integrations.fetch_failed", { companyId: context.company.id, message: error.message });
    return jsonError(error.message, 500);
  }

  logInfo("integrations.fetched", { companyId: context.company.id, count: data?.length || 0 });
  return Response.json({ integrations: data || [] });
}
