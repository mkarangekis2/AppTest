import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateRecommendations } from "@/services/recommendation-engine/engine";
import { MODULE_CATALOG } from "@/config/modules";
import { PACKAGE_CATALOG } from "@/config/packages";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) {
    return jsonError("No onboarding context found. Complete onboarding first.", 404);
  }

  const items = generateRecommendations(context.payload);

  const { error: clearError } = await supabase.from("recommendations").delete().eq("company_id", context.company.id);
  if (clearError) {
    return jsonError(clearError.message, 500);
  }

  if (items.length) {
    const moduleSlugToId = new Map<string, string>();
    const packageSlugToId = new Map<string, string>();

    const [{ data: moduleRows }, { data: packageRows }] = await Promise.all([
      supabase.from("modules").select("id,slug"),
      supabase.from("packages").select("id,slug")
    ]);

    for (const row of moduleRows || []) moduleSlugToId.set(row.slug, row.id);
    for (const row of packageRows || []) packageSlugToId.set(row.slug, row.id);

    const { error: insertError } = await supabase.from("recommendations").insert(
      items.map((item) => ({
        company_id: context.company.id,
        recommendation_type: item.recommendationType,
        module_id: item.recommendationType === "module" ? moduleSlugToId.get(item.slug) || null : null,
        package_id: item.recommendationType === "package" ? packageSlugToId.get(item.slug) || null : null,
        reason: item.reason,
        impact_level: item.expectedImpact,
        implementation_complexity: item.implementationComplexity,
        evidence_json: item.evidence,
        created_by: user.id
      }))
    );

    if (insertError) {
      return jsonError(insertError.message, 500);
    }
  }

  return Response.json({ company: context.company, recommendations: items });
}

export async function POST() {
  return jsonError("Use GET /api/recommendations.", 405);
}

export async function PUT() {
  return jsonError("Method not allowed.", 405);
}
