import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const [clientsResult, leadsResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id,name,segment,status,annual_value,renewal_date,churn_risk,updated_at")
      .eq("company_id", context.company.id)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("leads")
      .select("id,source,first_name,last_name,company_name,score,status,created_at")
      .eq("company_id", context.company.id)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  if (clientsResult.error) return jsonError(clientsResult.error.message, 500);
  if (leadsResult.error) return jsonError(leadsResult.error.message, 500);

  return Response.json({
    clients: clientsResult.data || [],
    leads: leadsResult.data || []
  });
}
