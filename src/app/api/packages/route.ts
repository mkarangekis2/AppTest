import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { PACKAGE_CATALOG } from "@/config/packages";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  return Response.json({ packages: PACKAGE_CATALOG });
}
