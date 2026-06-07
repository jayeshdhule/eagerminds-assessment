import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Public profile: anyone (no login) can see a user's public bookmarks here.
// We resolve the handle case-insensitively. We use the admin client only to
// read public data — never to leak anything private (we filter is_public = true).
export default async function PublicProfile({ params }: { params: { handle: string } }) {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, handle")
    .ilike("handle", params.handle)
    .maybeSingle();
  if (!profile) notFound();

  const { data: bookmarks } = await admin
    .from("bookmarks")
    .select("id,title,url,created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen grain">
      <nav className="flex items-center justify-between px-6 sm:px-12 py-6">
        <Link href="/" className="font-display text-2xl">EagerMinds</Link>
        <Link href="/signup" className="btn-ghost text-sm">Make your own →</Link>
      </nav>

      <section className="px-6 sm:px-12 pt-12 pb-8 max-w-2xl">
        <div className="text-xs tracking-[0.2em] uppercase text-clay mb-3">Public profile</div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight mb-3">
          @{profile.handle}
        </h1>
        <p className="text-sm text-ink/60">
          {(bookmarks?.length || 0)} public bookmark{(bookmarks?.length || 0) === 1 ? "" : "s"}
        </p>
      </section>

      <section className="px-6 sm:px-12 pb-24 max-w-2xl">
        {!bookmarks || bookmarks.length === 0 ? (
          <div className="card p-10 text-center text-ink/60" data-testid="empty-public">
            Nothing public here yet. Check back later.
          </div>
        ) : (
          <ul className="space-y-2" data-testid="public-bookmarks">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="card block p-5 hover:border-clay hover:bg-white transition"
                  data-testid={`public-bookmark-${b.id}`}
                >
                  <div className="font-medium mb-1">{b.title}</div>
                  <div className="text-sm text-ink/50 truncate">{b.url}</div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
