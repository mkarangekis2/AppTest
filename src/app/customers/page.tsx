import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { EmptyState, TableShell } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export default async function CustomersPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <EmptyState title="Complete onboarding first" detail="Customer and pipeline views unlock after onboarding." />
        </section>
      </div>
    );
  }

  const [leadsResult, clientsResult, oppsResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id,first_name,last_name,company_name,status,score,created_at")
      .eq("company_id", context.company.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("clients")
      .select("id,name,segment,status,annual_value,churn_risk,updated_at")
      .eq("company_id", context.company.id)
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("opportunities")
      .select("id,stage,value,risk_level,close_probability,updated_at")
      .eq("company_id", context.company.id)
      .order("updated_at", { ascending: false })
      .limit(30)
  ]);

  const leads = leadsResult.data || [];
  const clients = clientsResult.data || [];
  const opportunities = oppsResult.data || [];
  const atRisk = opportunities.filter((item) => item.risk_level === "high").length;
  const pipeline = opportunities.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Customers"
        title="Leads, opportunities, and client health in one surface"
        description="Operational customer view for demand, risk, and growth signal tracking."
        badges={
          <>
            <span className="badge info">Customer operations view</span>
            <span className="badge ghost">Pipeline visibility</span>
          </>
        }
      />

      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Lead volume</div>
          <div className="metric-value">{leads.length}</div>
          <div className="muted">Recent inbound prospects</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Client records</div>
          <div className="metric-value">{clients.length}</div>
          <div className="muted">Tracked customer accounts</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open pipeline</div>
          <div className="metric-value">${pipeline.toLocaleString()}</div>
          <div className="muted">Opportunity value</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">At-risk opportunities</div>
          <div className="metric-value">{atRisk}</div>
          <div className="muted">High-risk deals requiring attention</div>
        </div>
      </section>

      <section className="grid two">
        <TableShell title="Recent inbound prospects" subtitle="Leads">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leads.length ? (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unknown"}</td>
                    <td>{lead.company_name || "-"}</td>
                    <td><span className="badge ghost">{lead.status}</span></td>
                    <td>{lead.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No leads yet" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>

        <TableShell title="Account status and churn signals" subtitle="Clients">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Segment</th>
                <th>Status</th>
                <th>Churn risk</th>
              </tr>
            </thead>
            <tbody>
              {clients.length ? (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.segment || "-"}</td>
                    <td><span className="badge ghost">{client.status}</span></td>
                    <td><span className={`badge ${client.churn_risk === "high" ? "danger" : client.churn_risk === "medium" ? "warning" : "success"}`}>{client.churn_risk}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No clients yet" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>
      </section>

      <TableShell title="Pipeline risk and value" subtitle="Opportunities">
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Value</th>
              <th>Close probability</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.length ? (
                opportunities.map((opportunity) => (
                  <tr key={opportunity.id}>
                    <td><span className="badge ghost">{opportunity.stage}</span></td>
                    <td>${Number(opportunity.value || 0).toLocaleString()}</td>
                    <td>{opportunity.close_probability}%</td>
                    <td><span className={`badge ${opportunity.risk_level === "high" ? "danger" : opportunity.risk_level === "medium" ? "warning" : "success"}`}>{opportunity.risk_level}</span></td>
                  </tr>
                ))
              ) : (
              <tr>
                <td colSpan={4}>
                  <EmptyState title="No opportunities yet" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}
