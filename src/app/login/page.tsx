import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const { user } = await getOptionalUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="auth-shell stack">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Platform access</span>
          <span className="badge warning">Secure business workspace</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Access</div>
          <h1 className="packet-title" style={{ margin: 0 }}>Sign in to access your ACG operations workspace</h1>
        </div>
        <p className="lede">
          Access onboarding diagnostics, analysis outputs, recommendations, and workflow visibility controls.
        </p>
      </section>
      <LoginForm />
    </div>
  );
}
