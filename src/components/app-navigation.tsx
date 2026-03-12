"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  group?: string;
};

export function AppNavigation({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const grouped = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.group || "Workspace";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <nav className="sidebar-nav" aria-label="Primary">
      {Object.entries(grouped).map(([group, groupItems]) => (
        <div key={group} className="sidebar-group">
          <div className="sidebar-group-label">{group}</div>
          <div className="sidebar-group-items">
            {groupItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  href={item.href as Route}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
