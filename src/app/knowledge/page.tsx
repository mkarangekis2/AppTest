import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { KnowledgeWorkspace } from "@/components/knowledge-workspace";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export default async function KnowledgePage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <EmptyState title="Complete onboarding first" detail="Knowledge indexing and retrieval are enabled after onboarding." />
        </section>
      </div>
    );
  }

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Knowledge"
        title="Capture, index, and retrieve internal operational knowledge"
        description="Centralize SOPs and internal reference material for semantic retrieval and workflow context."
        badges={
          <>
            <span className="badge info">Knowledge system</span>
            <span className="badge ghost">Semantic retrieval</span>
          </>
        }
      />
      <KnowledgeWorkspace />
    </div>
  );
}
