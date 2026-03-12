import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { MODULE_CATALOG } from "@/config/modules";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  return Response.json({ modules: MODULE_CATALOG });
}
