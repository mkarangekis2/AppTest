import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { KpiGrid } from "@/components/kpi-grid";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export default async function ReportsPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <EmptyState title="Complete onboarding first" detail="Executive reporting is available after onboarding." />
        </section>
      </div>
    );
  }

  const [leadsResult, oppsResult, clientsResult, runsResult] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("company_id", context.company.id),
    supabase.from("opportunities").select("value,risk_level").eq("company_id", context.company.id),
    supabase.from("clients").select("id,churn_risk").eq("company_id", context.company.id),
    supabase.from("workflow_runs").select("id,status").eq("company_id", context.company.id).limit(200)
  ]);

  const pipelineValue = (oppsResult.data || []).reduce((sum, item) => sum + Number(item.value || 0), 0);
  const atRiskOpps = (oppsResult.data || []).filter((item) => item.risk_level === "high").length;
  const churnRisk = (clientsResult.data || []).filter((item) => item.churn_risk === "high").length;
  const totalRuns = (runsResult.data || []).length;
  const successRuns = (runsResult.data || []).filter((run) => run.status === "completed").length;
  const successRate = totalRuns ? Math.round((successRuns / totalRuns) * 100) : 0;

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Reports"
        title="Operational health and revenue visibility"
        description="Executive command view for growth, risk, retention, and automation reliability."
        badges={
          <>
            <span className="badge info">Executive dashboard</span>
            <span className="badge ghost">KPI command view</span>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Lead volume", value: leadsResult.count || 0, note: "Tracked leads in current workspace" },
          { label: "Pipeline value", value: `$${pipelineValue.toLocaleString()}`, note: "Open opportunity value" },
          { label: "At-risk opportunities", value: atRiskOpps, note: "High risk pipeline items" },
          { label: "Client count", value: (clientsResult.data || []).length, note: "Active client records" },
          { label: "Churn risk clients", value: churnRisk, note: "High churn-risk accounts" },
          { label: "Workflow success", value: `${successRate}%`, note: "Completed workflow run ratio" }
        ]}
      />

      <section className="grid three">
        <article className="card stack">
          <div className="eyebrow">Revenue risk</div>
          <div className="muted">At-risk opportunities: {atRiskOpps}</div>
          <div className="muted">Pipeline value: ${pipelineValue.toLocaleString()}</div>
        </article>
        <article className="card stack">
          <div className="eyebrow">Retention risk</div>
          <div className="muted">High churn-risk clients: {churnRisk}</div>
          <div className="muted">Total clients: {(clientsResult.data || []).length}</div>
        </article>
        <article className="card stack card-dark">
          <div className="eyebrow">Automation health</div>
          <div className="muted">Workflow success rate: {successRate}%</div>
          <div className="muted">Total runs observed: {totalRuns}</div>
        </article>
      </section>

      <section className="grid two">
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Revenue health</div>
            <h2 style={{ margin: 0 }}>Pipeline quality signals</h2>
          </div>
          <ul className="list-tight">
            <li>Total open pipeline: ${pipelineValue.toLocaleString()}</li>
            <li>High-risk opportunities: {atRiskOpps}</li>
            <li>Action: prioritize follow-up automation for stale stages.</li>
          </ul>
        </article>

        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Delivery health</div>
            <h2 style={{ margin: 0 }}>Execution and retention signals</h2>
          </div>
          <ul className="list-tight">
            <li>Workflow execution success: {successRate}%</li>
            <li>High churn-risk clients: {churnRisk}</li>
            <li>Action: enable SLA and sentiment workflows where risk is elevated.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
