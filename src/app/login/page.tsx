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
          <span className="badge info">Proctor access</span>
          <span className="badge warning">Training-only environment</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Access</div>
          <h1 className="packet-title" style={{ margin: 0 }}>Sign in to run and review casualty lanes</h1>
        </div>
        <p className="lede">
          This system supports training and evaluation workflows only. It does not provide real-world medical advice.
        </p>
      </section>
      <LoginForm />
    </div>
  );
}
