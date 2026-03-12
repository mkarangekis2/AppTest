import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getPrimaryCompany } from "@/lib/acg/company";
import { AiAppStudio } from "@/components/ai-app-studio";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

type AppSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  provider: "openai" | "anthropic";
  model: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default async function AppsPage() {
  const { supabase, user } = await requireUser();
  const company = await getPrimaryCompany(supabase as any, user.id);

  if (!company) {
    return (
      <div className="shell-grid">
        <section className="card stack">
          <EmptyState
            title="Complete onboarding first"
            detail="AI Apps are scoped to a company workspace. Initialize your company profile to continue."
            action={
              <Link className="button" href={"/onboarding" as Route}>
                Start onboarding
              </Link>
            }
          />
        </section>
      </div>
    );
  }

  const { data: apps } = await supabase
    .from("ai_apps")
    .select("id,name,slug,description,provider,model,is_active,created_at,updated_at")
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="App studio"
        title="Build internal AI apps your teams can run daily"
        description="Define reusable AI app behavior with prompts and models, then execute in a governed runtime with run history and output inspection."
        badges={
          <>
            <span className="badge info">AI Apps</span>
            <span className="badge ghost">Provider-agnostic runtime</span>
            <span className="badge success">{(apps as AppSummary[] | null)?.length || 0} configured</span>
            <span className="badge">{company.name}</span>
          </>
        }
      />

      <AiAppStudio initialApps={(apps as AppSummary[]) || []} />
    </div>
  );
}
