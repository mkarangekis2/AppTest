import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { buildAar } from "@/lib/scoring";

export default async function AarPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireUser();
  const [{ data: session }, { data: events }, { data: score }] = await Promise.all([
    supabase.from("sessions").select("*, scenarios(name)").eq("id", params.id).maybeSingle(),
    supabase.from("events").select("*").eq("session_id", params.id).order("ts", { ascending: true }),
    supabase.from("scores").select("*").eq("session_id", params.id).maybeSingle()
  ]);

  if (!session) {
    notFound();
  }

  const timeline = buildAar(events || []);

  return (
    <div className="stack">
      <section className="card stack">
        <div className="eyebrow">After-Action Report</div>
        <h1 style={{ margin: 0 }}>{session.scenarios?.name || "Scenario"} AAR</h1>
        <div className="muted">Printable report view. Use the browser print dialog for PDF export.</div>
      </section>
      <section className="grid two">
        <div className="card stack">
          <div className="eyebrow">Score Summary</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(score?.score_json || {}, null, 2)}</pre>
        </div>
        <div className="card stack">
          <div className="eyebrow">Session State</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(
              {
                current_stage: session.current_stage,
                current_vitals: session.current_vitals_json,
                started_at: session.started_at,
                ended_at: session.ended_at
              },
              null,
              2
            )}
          </pre>
        </div>
      </section>
      <section className="card stack">
        <div className="eyebrow">Timeline Replay</div>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((item) => (
                <tr key={`${item.ts}-${item.type}`}>
                  <td>{new Date(item.ts).toLocaleString()}</td>
                  <td>{item.type}</td>
                  <td>{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
