import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { IntegrationsConsole } from "@/components/integrations-console";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

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
          <EmptyState title="Complete onboarding first" detail="Integrations can be configured after workspace onboarding." />
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
      <PageHeader
        eyebrow="Integrations"
        title="Connect external systems to activate automation"
        description="Link key providers to expand workflow automation and improve operational telemetry."
        badges={
          <>
            <span className="badge info">Integrations</span>
            <span className="badge ghost">Connectivity and provider health</span>
          </>
        }
      />
      <IntegrationsConsole initialRows={(data || []) as IntegrationRow[]} />
    </div>
  );
}
