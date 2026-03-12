"use client";

import { useState } from "react";
import { EmptyState, Notice } from "@/components/ui/feedback";

type ResultRow = {
  id: string;
  documentId: string;
  chunkIndex: number;
  title: string;
  documentType: string;
  source: string;
  excerpt: string;
  score: number;
};

export function KnowledgeWorkspace() {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("sop");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultRow[]>([]);
  const [pending, setPending] = useState<"upload" | "search" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function uploadDocument() {
    setPending("upload");
    setError(null);
    setStatus(null);
    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, documentType, content, source: "manual" })
      });
      const body = (await response.json()) as { error?: string; chunkCount?: number };
      if (!response.ok) {
        throw new Error(body.error || "Upload failed.");
      }
      setStatus(`Document indexed with ${body.chunkCount || 0} chunks.`);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(null);
    }
  }

  async function searchKnowledge() {
    setPending("search");
    setError(null);
    setStatus(null);
    try {
      const response = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
      const body = (await response.json()) as { error?: string; results?: ResultRow[] };
      if (!response.ok) {
        throw new Error(body.error || "Search failed.");
      }
      setResults(body.results || []);
      setStatus(`${body.results?.length || 0} results found.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid two">
      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Document upload</div>
          <h2 style={{ margin: 0 }}>Index SOPs and internal knowledge</h2>
        </div>
        <div className="field">
          <label htmlFor="doc-title">Title</label>
          <input id="doc-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="doc-type">Document type</label>
          <select id="doc-type" value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
            <option value="sop">SOP</option>
            <option value="playbook">Playbook</option>
            <option value="policy">Policy</option>
            <option value="guide">Guide</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="doc-content">Content</label>
          <textarea id="doc-content" value={content} onChange={(event) => setContent(event.target.value)} />
        </div>
        <div className="action-row">
          <button disabled={!title.trim() || !content.trim() || pending !== null} onClick={uploadDocument}>
            {pending === "upload" ? "Indexing..." : "Upload and index"}
          </button>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Semantic retrieval</div>
          <h2 style={{ margin: 0 }}>Search internal knowledge</h2>
        </div>
        <div className="field">
          <label htmlFor="knowledge-query">Search query</label>
          <input id="knowledge-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="How do we onboard a client?" />
        </div>
        <div className="action-row">
          <button className="secondary" disabled={!query.trim() || pending !== null} onClick={searchKnowledge}>
            {pending === "search" ? "Searching..." : "Search"}
          </button>
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {status ? <Notice tone="info">{status}</Notice> : null}
        <div className="timeline-list">
          {results.length ? (
            results.map((row) => (
              <article key={row.id} className="timeline-item">
                <div className="timeline-meta">
                  <span className="badge">{row.documentType}</span>
                  <span className="badge ghost">{row.source}</span>
                  <span className="badge info">score {row.score}</span>
                </div>
                <strong>{row.title}</strong>
                <div className="muted">{row.excerpt}</div>
              </article>
            ))
          ) : (
            <EmptyState title="No search results yet" detail="Run a semantic query to retrieve indexed knowledge." />
          )}
        </div>
      </section>
    </div>
  );
}
