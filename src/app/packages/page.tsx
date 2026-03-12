import { requireUser } from "@/lib/auth";
import { PACKAGE_CATALOG } from "@/config/packages";
import { PackageMarketplace } from "@/components/package-marketplace";
import { PageHeader } from "@/components/ui/page-header";

export default async function PackagesPage() {
  await requireUser();

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Packages"
        title="Install bundled systems in implementation order"
        badges={
          <>
            <span className="badge info">Package marketplace</span>
            <span className="badge ghost">Bundle installs</span>
            <span className="badge">{PACKAGE_CATALOG.length} launch packages</span>
          </>
        }
      />
      <PackageMarketplace packages={PACKAGE_CATALOG} />
    </div>
  );
}
