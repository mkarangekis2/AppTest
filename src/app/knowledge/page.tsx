import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { KnowledgeWorkspace } from "@/components/knowledge-workspace";

export default async function KnowledgePage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card">
          <div className="empty-state">Complete onboarding first to use the knowledge system.</div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Knowledge system</span>
          <span className="badge ghost">Phase 5 scaffold</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Knowledge</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Capture, index, and retrieve internal operational knowledge
          </h1>
        </div>
      </section>
      <KnowledgeWorkspace />
    </div>
  );
}
