import type { ReactNode } from "react";

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-title">{title}</div>
      {detail ? <div className="empty-detail">{detail}</div> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

export function Notice({
  tone = "info",
  children
}: {
  tone?: "info" | "error" | "warning" | "success";
  children: ReactNode;
}) {
  const toneClass =
    tone === "error" ? "danger" : tone === "warning" ? "warning" : tone === "success" ? "success" : "info";
  return (
    <div className={`notice ${toneClass}`} role={tone === "error" ? "alert" : "status"} aria-live="polite">
      {children}
    </div>
  );
}

export function TableShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <article className="card stack">
      <div className="section-heading">
        <div className="eyebrow">{subtitle || "Data"}</div>
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>
      <div className="table-wrap">
        <div className="table">{children}</div>
      </div>
    </article>
  );
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="stack tight" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-line" />
      ))}
    </div>
  );
}
