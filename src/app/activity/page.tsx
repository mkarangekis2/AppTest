import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";

export default async function ActivityPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <div className="empty-state">Complete onboarding first to view workflow activity.</div>
        </section>
      </div>
    );
  }

  const { data: runs } = await supabase
    .from("workflow_runs")
    .select("id,status,input_json,output_json,error_message,started_at,finished_at")
    .eq("company_id", context.company.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Workflow activity center</span>
          <span className="badge ghost">Phase 4 scaffold</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Activity</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Execution timeline and run outcomes
          </h1>
        </div>
      </section>

      <section className="card stack">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Started</th>
                <th>Status</th>
                <th>Input</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              {runs?.length ? (
                runs.map((run) => (
                  <tr key={run.id}>
                    <td>{new Date(run.started_at).toLocaleString()}</td>
                    <td>{run.status}</td>
                    <td>{JSON.stringify(run.input_json)}</td>
                    <td>{run.error_message ? run.error_message : JSON.stringify(run.output_json)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No workflow runs yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
