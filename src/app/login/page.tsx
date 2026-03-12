import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function LoginPage() {
  const { user } = await getOptionalUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="auth-shell stack">
      <PageHeader
        eyebrow="Access"
        title="Sign in to access your ACG operations workspace"
        description="Access onboarding diagnostics, analysis outputs, recommendations, and workflow visibility controls."
        badges={
          <>
            <span className="badge info">Platform access</span>
            <span className="badge warning">Secure business workspace</span>
          </>
        }
      />
      <LoginForm />
    </div>
  );
}
