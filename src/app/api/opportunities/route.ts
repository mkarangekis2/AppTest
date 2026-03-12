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
    .from("opportunities")
    .select("id,stage,value,close_probability,risk_level,next_step,last_activity_at,updated_at")
    .eq("company_id", context.company.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return jsonError(error.message, 500);
  return Response.json({ opportunities: data || [] });
}
