import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getPrimaryCompany } from "@/lib/acg/company";
import { AiAppStudio } from "@/components/ai-app-studio";

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
          <div className="section-heading">
            <div className="eyebrow">AI Apps</div>
            <h1 style={{ margin: 0 }}>Complete onboarding first</h1>
          </div>
          <p className="muted">AI Apps are scoped to a company workspace. Initialize your company profile to continue.</p>
          <div>
            <Link className="button" href={"/onboarding" as Route}>
              Start onboarding
            </Link>
          </div>
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
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">AI Apps</span>
          <span className="badge ghost">Provider-agnostic runtime</span>
          <span className="badge">{company.name}</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">App studio</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Build internal AI apps your teams can run daily
          </h1>
        </div>
        <p className="lede">
          Define reusable AI app behavior with prompts and models, then execute prompts in a governed runtime with run
          history and output inspection.
        </p>
      </section>

      <AiAppStudio initialApps={(apps as AppSummary[]) || []} />
    </div>
  );
}
