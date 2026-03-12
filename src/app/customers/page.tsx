import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";

export default async function CustomersPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <div className="empty-state">Complete onboarding first to view customers and leads.</div>
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

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Customer operations view</span>
          <span className="badge ghost">Phase 6 scaffold</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Customers</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Leads, opportunities, and client health in one surface
          </h1>
        </div>
      </section>

      <section className="grid two">
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Leads</div>
            <h2 style={{ margin: 0 }}>Recent inbound prospects</h2>
          </div>
          <div className="table">
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
                      <td>{lead.status}</td>
                      <td>{lead.score}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>No leads yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Clients</div>
            <h2 style={{ margin: 0 }}>Account status and churn signals</h2>
          </div>
          <div className="table">
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
                      <td>{client.status}</td>
                      <td>{client.churn_risk}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>No clients yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Opportunities</div>
          <h2 style={{ margin: 0 }}>Pipeline risk and value</h2>
        </div>
        <div className="table">
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
                    <td>{opportunity.stage}</td>
                    <td>${Number(opportunity.value || 0).toLocaleString()}</td>
                    <td>{opportunity.close_probability}%</td>
                    <td>{opportunity.risk_level}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No opportunities yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
