import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { WorkflowCenter } from "@/components/workflow-center";

type WorkflowRow = {
  id: string;
  name: string;
  status: string;
  trigger_type: string;
  version: number;
  updated_at: string;
};

export default async function WorkflowsPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <div className="empty-state">Complete onboarding first to create workflows.</div>
        </section>
      </div>
    );
  }

  const { data: workflows } = await supabase
    .from("workflows")
    .select("id,name,status,trigger_type,version,updated_at")
    .eq("company_id", context.company.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Workflow engine</span>
          <span className="badge ghost">Phase 4 scaffold</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Workflows</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Build and execute operational automation logic
          </h1>
        </div>
      </section>
      <WorkflowCenter initialWorkflows={(workflows as WorkflowRow[]) || []} />
    </div>
  );
}
