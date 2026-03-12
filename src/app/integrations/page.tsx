import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { IntegrationsConsole } from "@/components/integrations-console";

type IntegrationRow = {
  id: string;
  provider: string;
  status: string;
  connected_at: string | null;
  updated_at: string;
};

export default async function IntegrationsPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <div className="empty-state">Complete onboarding first to configure integrations.</div>
        </section>
      </div>
    );
  }

  const { data } = await supabase
    .from("integrations")
    .select("id,provider,status,connected_at,updated_at")
    .eq("company_id", context.company.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Integrations</span>
          <span className="badge ghost">Connectivity and provider health</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Integrations</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Connect external systems to activate automation
          </h1>
        </div>
      </section>
      <IntegrationsConsole initialRows={(data || []) as IntegrationRow[]} />
    </div>
  );
}
