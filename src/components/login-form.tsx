"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const response =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (response.error) {
        throw response.error;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div className="eyebrow">Authentication</div>
        <h2 style={{ margin: 0 }}>Enter proctor credentials</h2>
      </div>
      <div className="field">
        <label htmlFor="mode">Mode</label>
        <select id="mode" value={mode} onChange={(event) => setMode(event.target.value as "login" | "signup")}>
          <option value="login">Sign in</option>
          <option value="signup">Create account</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>
      <div className="packet-block">
        <div className="eyebrow">Training control notice</div>
        <div className="muted">
          Sign in provides access to CONOP planning, scenario approval, live session control, and after-action review.
        </div>
      </div>
      {error ? <div className="muted">{error}</div> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
