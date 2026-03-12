import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { WorkflowCenter } from "@/components/workflow-center";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

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
          <EmptyState title="Complete onboarding first" detail="Workflow creation requires an active company profile." />
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
      <PageHeader
        eyebrow="Workflows"
        title="Build and execute operational automation logic"
        badges={
          <>
            <span className="badge info">Workflow engine</span>
            <span className="badge ghost">Trigger → Condition → Action</span>
          </>
        }
      />
      <WorkflowCenter initialWorkflows={(workflows as WorkflowRow[]) || []} />
    </div>
  );
}
