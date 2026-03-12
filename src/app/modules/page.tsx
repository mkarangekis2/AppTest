import { requireUser } from "@/lib/auth";
import { MODULE_CATALOG } from "@/config/modules";
import { ModuleMarketplace } from "@/components/module-marketplace";

export default async function ModulesPage() {
  await requireUser();

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Module marketplace</span>
          <span className="badge ghost">Phase 3 scaffold</span>
          <span className="badge">{MODULE_CATALOG.length} launch modules</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Modules</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Install operational systems by capability
          </h1>
        </div>
      </section>
      <ModuleMarketplace modules={MODULE_CATALOG} />
    </div>
  );
}
