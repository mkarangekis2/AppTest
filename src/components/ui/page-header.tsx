import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  badges?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, badges, actions }: PageHeaderProps) {
  return (
    <section className="hero card mission-hero page-header">
      {badges ? <div className="badge-row">{badges}</div> : null}
      <div className="section-heading">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="display-title" style={{ margin: 0 }}>
          {title}
        </h1>
      </div>
      {description ? <p className="lede">{description}</p> : null}
      {actions ? <div className="action-row">{actions}</div> : null}
    </section>
  );
}
