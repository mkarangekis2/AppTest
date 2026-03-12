import { requireUser } from "@/lib/auth";
import { MODULE_CATALOG } from "@/config/modules";
import { ModuleMarketplace } from "@/components/module-marketplace";
import { PageHeader } from "@/components/ui/page-header";

export default async function ModulesPage() {
  await requireUser();

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Modules"
        title="Install operational systems by capability"
        badges={
          <>
            <span className="badge info">Module marketplace</span>
            <span className="badge ghost">Catalog</span>
            <span className="badge">{MODULE_CATALOG.length} launch modules</span>
          </>
        }
      />
      <ModuleMarketplace modules={MODULE_CATALOG} />
    </div>
  );
}
