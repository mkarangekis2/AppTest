import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { EmptyState, TableShell } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export default async function ActivityPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <EmptyState title="Complete onboarding first" detail="Workflow activity unlocks after workspace onboarding." />
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
  const completed = (runs || []).filter((run) => run.status === "completed").length;
  const failed = (runs || []).filter((run) => run.status === "failed").length;

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Activity"
        title="Execution timeline and run outcomes"
        description="Inspect run-level operational telemetry, failures, and output traces."
        badges={
          <>
            <span className="badge info">Workflow activity center</span>
            <span className="badge ghost">Operations telemetry</span>
          </>
        }
      />

      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Recent runs</div>
          <div className="metric-value">{runs?.length || 0}</div>
          <div className="muted">Latest execution records</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Completed</div>
          <div className="metric-value">{completed}</div>
          <div className="muted">Successful executions</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Failed</div>
          <div className="metric-value">{failed}</div>
          <div className="muted">Runs requiring investigation</div>
        </div>
      </section>

      <TableShell title="Recent workflow runs" subtitle="Execution history">
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
                  <td>
                    <span className={`badge ${run.status === "failed" ? "danger" : run.status === "running" ? "warning" : "success"}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="muted">{JSON.stringify(run.input_json)}</td>
                  <td className="muted">{run.error_message ? run.error_message : JSON.stringify(run.output_json)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <EmptyState title="No workflow runs yet" detail="Run a workflow to start collecting execution history." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}
