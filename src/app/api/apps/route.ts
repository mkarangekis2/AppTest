import { requireApiUser } from "@/lib/auth";
import { jsonError, parseJsonBody } from "@/lib/http";
import { getPrimaryCompany } from "@/lib/acg/company";
import { getUserRole, canInstallSystems } from "@/lib/permissions/rbac";
import { slugifyName, validateCreateAiAppInput } from "@/lib/ai/apps";

export async function GET() {
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
    .from("ai_apps")
    .select("id,name,slug,description,provider,model,is_active,created_at,updated_at")
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return jsonError(error.message, 500);
  }

  return Response.json({ apps: data || [] });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  const role = getUserRole(auth.user as any);
  if (!canInstallSystems(role)) {
    return jsonError("Forbidden.", 403);
  }

  const body = await parseJsonBody<unknown>(request);
  const validated = validateCreateAiAppInput(body);
  if (!validated.valid) {
    return jsonError(validated.error);
  }

  const { supabase, user } = auth;
  const company = await getPrimaryCompany(supabase as any, user.id);
  if (!company) {
    return jsonError("No company profile found. Complete onboarding first.", 404);
  }

  const slug = slugifyName(validated.data.name);
  if (!slug) {
    return jsonError("Could not generate slug from name.");
  }

  const { data, error } = await supabase
    .from("ai_apps")
    .insert({
      company_id: company.id,
      created_by: user.id,
      name: validated.data.name,
      slug,
      description: validated.data.description || "",
      provider: validated.data.provider,
      model: validated.data.model,
      system_prompt: validated.data.systemPrompt,
      input_schema_json: validated.data.inputSchemaJson || {},
      output_schema_json: validated.data.outputSchemaJson || {},
      app_config_json: {}
    })
    .select("id,name,slug,description,provider,model,is_active,created_at,updated_at")
    .maybeSingle();

  if (error || !data) {
    if (error?.code === "23505") {
      return jsonError("An app with that name already exists for this company.", 409);
    }
    return jsonError(error?.message || "Failed to create AI app.", 500);
  }

  return Response.json({ app: data }, { status: 201 });
}
