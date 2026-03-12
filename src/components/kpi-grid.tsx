export function KpiGrid({
  items
}: {
  items: Array<{ label: string; value: string | number; note: string }>;
}) {
  return (
    <section className="metric-grid">
      {items.map((item) => (
        <div key={item.label} className="metric-card">
          <div className="metric-label">{item.label}</div>
          <div className="metric-value">{item.value}</div>
          <div className="muted">{item.note}</div>
        </div>
      ))}
    </section>
  );
}
