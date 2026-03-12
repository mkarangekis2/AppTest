import { requireUser } from "@/lib/auth";
import { PACKAGE_CATALOG } from "@/config/packages";
import { PackageMarketplace } from "@/components/package-marketplace";

export default async function PackagesPage() {
  await requireUser();

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Package marketplace</span>
          <span className="badge ghost">Phase 3 scaffold</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Packages</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Install bundled systems in implementation order
          </h1>
        </div>
      </section>
      <PackageMarketplace packages={PACKAGE_CATALOG} />
    </div>
  );
}
