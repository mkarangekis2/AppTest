import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateBusinessAnalysis } from "@/services/business-analysis/engine";

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

  const analysis = generateBusinessAnalysis(context.payload);
  return Response.json({ company: context.company, analysis });
}
