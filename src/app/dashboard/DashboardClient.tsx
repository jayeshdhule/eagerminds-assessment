"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export default function DashboardClient({
  initial, handle, email,
}: { initial: Bookmark[]; handle: string; email: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Bookmark[]>(initial);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eUrl, setEUrl] = useState("");
  const [eIsPublic, setEIsPublic] = useState(false);

  async function addBookmark(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, is_public: isPublic }),
      });
      const j = await res.json();
      if (!res.ok) { setErr(j.error || "Failed to add"); return; }
      setItems((prev) => [j.bookmark, ...prev]);
      setTitle(""); setUrl(""); setIsPublic(false);
    } finally { setBusy(false); }
  }

  async function togglePublic(b: Bookmark) {
    const next = !b.is_public;
    setItems((prev) => prev.map((x) => x.id === b.id ? { ...x, is_public: next } : x));
    const res = await fetch(`/api/bookmarks/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: next }),
    });
    if (!res.ok) {
      setItems((prev) => prev.map((x) => x.id === b.id ? { ...x, is_public: !next } : x));
    }
  }

  async function remove(b: Bookmark) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    const prev = items;
    setItems(items.filter((x) => x.id !== b.id));
    const res = await fetch(`/api/bookmarks/${b.id}`, { method: "DELETE" });
    if (!res.ok) setItems(prev);
  }

  function startEdit(b: Bookmark) {
    setEditingId(b.id); setETitle(b.title); setEUrl(b.url); setEIsPublic(b.is_public);
  }
  async function saveEdit(b: Bookmark) {
    const res = await fetch(`/api/bookmarks/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: eTitle, url: eUrl, is_public: eIsPublic }),
    });
    const j = await res.json();
    if (!res.ok) { alert(j.error || "Update failed"); return; }
    setItems((prev) => prev.map((x) => x.id === b.id ? j.bookmark : x));
    setEditingId(null);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const publicCount = items.filter((b) => b.is_public).length;

  return (
    <main className="min-h-screen grain">
      <nav className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-ink/10">
        <Link href="/" className="font-display text-2xl">EagerMinds</Link>
        <div className="flex items-center gap-3">
          <Link href={`/${handle}`} className="btn-ghost text-sm" data-testid="view-public-profile">
            View public profile →
          </Link>
          <button onClick={logout} className="btn-ghost text-sm" data-testid="logout-button">Log out</button>
        </div>
      </nav>

      <section className="px-6 sm:px-12 pt-10 pb-6 max-w-5xl">
        <div className="text-xs tracking-[0.2em] uppercase text-clay mb-2">Signed in as {email}</div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight mb-2">
          @{handle}<span className="text-ink/30">'s</span> bookmarks
        </h1>
        <p className="text-sm text-ink/60">
          {items.length} total · {publicCount} public · {items.length - publicCount} private
        </p>
      </section>

      <section className="px-6 sm:px-12 pb-6 max-w-5xl">
        <form onSubmit={addBookmark} className="card p-5 grid sm:grid-cols-12 gap-3" data-testid="add-bookmark-form">
          <div className="sm:col-span-4">
            <label className="label" htmlFor="b-title">Title</label>
            <input id="b-title" className="input" required maxLength={200}
              value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My favorite essay" data-testid="bookmark-title" />
          </div>
          <div className="sm:col-span-5">
            <label className="label" htmlFor="b-url">URL</label>
            <input id="b-url" className="input" required value={url}
              onChange={(e) => setUrl(e.target.value)} placeholder="https://…" data-testid="bookmark-url" />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} data-testid="bookmark-public" />
              <span>Public</span>
            </label>
          </div>
          <div className="sm:col-span-1 flex items-end">
            <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="bookmark-submit">
              {busy ? "…" : "Add"}
            </button>
          </div>
          {err && (
            <div className="sm:col-span-12 text-sm text-clay" data-testid="bookmark-error">{err}</div>
          )}
        </form>
      </section>

      <section className="px-6 sm:px-12 pb-24 max-w-5xl">
        {items.length === 0 ? (
          <div className="card p-10 text-center text-ink/60" data-testid="empty-state">
            No bookmarks yet. Add your first one above.
          </div>
        ) : (
          <ul className="space-y-3" data-testid="bookmark-list">
            {items.map((b) => (
              <li key={b.id} className="card p-4 sm:p-5" data-testid={`bookmark-${b.id}`}>
                {editingId === b.id ? (
                  <div className="grid sm:grid-cols-12 gap-3">
                    <input className="input sm:col-span-4" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                    <input className="input sm:col-span-5" value={eUrl} onChange={(e) => setEUrl(e.target.value)} />
                    <label className="sm:col-span-1 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={eIsPublic} onChange={(e) => setEIsPublic(e.target.checked)} />
                      Public
                    </label>
                    <div className="sm:col-span-2 flex gap-2">
                      <button onClick={() => saveEdit(b)} className="btn-primary flex-1" data-testid={`save-${b.id}`}>Save</button>
                      <button onClick={() => setEditingId(null)} className="btn-ghost">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{b.title}</span>
                        {b.is_public ? (
                          <span className="text-[10px] uppercase tracking-wider bg-clay/10 text-clay px-1.5 py-0.5 rounded">Public</span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider bg-ink/5 text-ink/60 px-1.5 py-0.5 rounded">Private</span>
                        )}
                      </div>
                      <a href={b.url} target="_blank" rel="noreferrer noopener"
                         className="text-sm text-ink/60 hover:text-clay break-all">
                        {b.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePublic(b)} className="btn-ghost text-xs" data-testid={`toggle-${b.id}`}>
                        Make {b.is_public ? "private" : "public"}
                      </button>
                      <button onClick={() => startEdit(b)} className="btn-ghost text-xs" data-testid={`edit-${b.id}`}>Edit</button>
                      <button onClick={() => remove(b)} className="btn-ghost text-xs text-clay" data-testid={`delete-${b.id}`}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
