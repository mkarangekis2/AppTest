"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

type QuickItem = {
  href: string;
  label: string;
  hint?: string;
};

export function CommandPalette({ items }: { items: readonly QuickItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isOpenShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isOpenShortcut) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.hint || ""}`.toLowerCase().includes(q));
  }, [items, query]);

  function select(href: string) {
    setOpen(false);
    router.push(href as Route);
  }

  return (
    <>
      <button className="button secondary compact command-launch" onClick={() => setOpen(true)} aria-label="Open command palette">
        Search
        <span className="kbd">Ctrl K</span>
      </button>
      {open ? (
        <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette" onClick={() => setOpen(false)}>
          <div className="command-modal" onClick={(event) => event.stopPropagation()}>
            <div className="field">
              <label htmlFor="command-search">Jump to</label>
              <input
                id="command-search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages, tools, workflows..."
              />
            </div>
            <div className="command-results">
              {filtered.map((item) => (
                <button key={item.href} className="command-result" onClick={() => select(item.href)}>
                  <span>{item.label}</span>
                  {item.hint ? <span className="command-hint">{item.hint}</span> : null}
                </button>
              ))}
              {filtered.length === 0 ? <div className="empty-state">No results. Try a broader search.</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
