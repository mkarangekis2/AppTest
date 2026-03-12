import { requireUser } from "@/lib/auth";
import { INDUSTRY_PACK_CATALOG } from "@/config/industry-packs";
import { PageHeader } from "@/components/ui/page-header";

export default async function IndustryPacksPage() {
  await requireUser();

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Vertical acceleration"
        title="Preconfigured module stacks and KPI presets by industry"
        description="Deploy sector-specific operating stacks with curated workflows and KPI lenses."
        badges={
          <>
            <span className="badge info">Industry packs</span>
            <span className="badge ghost">{INDUSTRY_PACK_CATALOG.length} vertical presets</span>
          </>
        }
      />

      <section className="grid two">
        {INDUSTRY_PACK_CATALOG.map((pack) => (
          <article key={pack.slug} className="card stack">
            <div className="badge-row">
              <span className="badge info">Industry pack</span>
              <span className="badge ghost">{pack.industries.join(", ")}</span>
            </div>
            <h2 style={{ margin: 0 }}>{pack.name}</h2>
            <p className="muted">{pack.description}</p>
            <div className="packet-block">
              <div className="eyebrow">Included modules</div>
              <ul className="list-tight">
                {pack.includedModuleSlugs.map((moduleSlug) => (
                  <li key={moduleSlug}>{moduleSlug}</li>
                ))}
              </ul>
            </div>
            <div className="grid two">
              <div className="packet-block">
                <div className="eyebrow">Default workflows</div>
                <ul className="list-tight">
                  {pack.defaultWorkflowTemplates.map((workflow) => (
                    <li key={workflow}>{workflow}</li>
                  ))}
                </ul>
              </div>
              <div className="packet-block">
                <div className="eyebrow">KPI presets</div>
                <ul className="list-tight">
                  {pack.kpiPresets.map((kpi) => (
                    <li key={kpi}>{kpi}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
