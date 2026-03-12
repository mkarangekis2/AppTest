import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const [{ data: settings }, { data: subscription }, { data: usage }] = await Promise.all([
    supabase
      .from("company_settings")
      .select("id,brand_voice_json,ai_behavior_json,notifications_json,updated_at")
      .eq("company_id", context.company.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan_name,status,billing_interval,started_at,renewed_at,expires_at")
      .eq("company_id", context.company.id)
      .maybeSingle(),
    supabase
      .from("usage_metrics")
      .select("metric_key,metric_value,period_start,period_end,created_at")
      .eq("company_id", context.company.id)
      .order("created_at", { ascending: false })
      .limit(25)
  ]);

  return Response.json({
    company: context.company,
    settings: settings || null,
    subscription: subscription || null,
    usageMetrics: usage || []
  });
}
