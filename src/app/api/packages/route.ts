import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { PACKAGE_CATALOG } from "@/config/packages";
import { ensureCatalogSeeded } from "@/lib/acg/catalog-sync";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    await ensureCatalogSeeded();
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Catalog sync failed.", 500);
  }

  return Response.json({ packages: PACKAGE_CATALOG });
}
