import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const { user } = await getOptionalUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="grid two">
      <section className="hero card">
        <div className="eyebrow">Access</div>
        <h1 style={{ margin: 0 }}>Proctor sign in</h1>
        <p className="muted" style={{ margin: 0 }}>
          This system supports training and evaluation workflows only. It does not provide real-world medical advice.
        </p>
      </section>
      <LoginForm />
    </div>
  );
}
