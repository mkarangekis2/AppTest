"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

function prettify(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AppBreadcrumbs() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = [{ label: "Home", href: "/" }];
  let path = "";
  for (const segment of parts) {
    path += `/${segment}`;
    crumbs.push({ label: prettify(segment), href: path });
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="crumb">
            {isLast ? (
              <span className="crumb-current">{crumb.label}</span>
            ) : (
              <Link href={crumb.href as Route} className="crumb-link">
                {crumb.label}
              </Link>
            )}
            {!isLast ? <span className="crumb-sep">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
