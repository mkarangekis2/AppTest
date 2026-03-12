import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const { supabase, user } = auth;
  const body = await parseJsonBody<{ slug?: string }>(request);
  if (!body.slug) {
    return jsonError("Package slug is required.");
  }

  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) {
    return jsonError("No company profile found. Complete onboarding first.", 404);
  }

  const { data: packageRow } = await supabase.from("packages").select("id,slug,name").eq("slug", body.slug).maybeSingle();
  if (!packageRow) {
    return jsonError("Package not found in database catalog. Seed packages first.", 404);
  }

  const { error } = await supabase.from("package_installations").upsert(
    {
      company_id: context.company.id,
      package_id: packageRow.id,
      status: "installed",
      updated_at: new Date().toISOString()
    },
    { onConflict: "company_id,package_id" }
  );

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ ok: true, package: packageRow });
}
