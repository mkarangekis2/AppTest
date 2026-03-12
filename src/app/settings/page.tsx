import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { SettingsConsole } from "@/components/settings-console";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <div className="empty-state">Complete onboarding first to configure settings.</div>
        </section>
      </div>
    );
  }

  const [{ data: subscription }, { data: usage }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan_name,status,billing_interval,started_at,renewed_at,expires_at")
      .eq("company_id", context.company.id)
      .maybeSingle(),
    supabase
      .from("usage_metrics")
      .select("metric_key,metric_value,period_start,period_end,created_at")
      .eq("company_id", context.company.id)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Settings and entitlements</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Settings</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Company profile, AI behavior, and usage controls
          </h1>
        </div>
      </section>

      <SettingsConsole initialCompanyName={context.company.name} initialWebsite={context.company.website || ""} />

      <section className="grid two">
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Subscription</div>
            <h2 style={{ margin: 0 }}>Plan and billing status</h2>
          </div>
          {subscription ? (
            <ul className="list-tight">
              <li>Plan: {subscription.plan_name}</li>
              <li>Status: {subscription.status}</li>
              <li>Interval: {subscription.billing_interval}</li>
              <li>Started: {new Date(subscription.started_at).toLocaleDateString()}</li>
            </ul>
          ) : (
            <div className="empty-state">No subscription record yet. Default entitlement model is active.</div>
          )}
        </article>
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Usage</div>
            <h2 style={{ margin: 0 }}>Tracked usage metrics</h2>
          </div>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {usage?.length ? (
                  usage.map((row, index) => (
                    <tr key={`${row.metric_key}-${row.created_at}-${index}`}>
                      <td>{row.metric_key}</td>
                      <td>{row.metric_value}</td>
                      <td>
                        {row.period_start} to {row.period_end}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>No usage metrics yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
