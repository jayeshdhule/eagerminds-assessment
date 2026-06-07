import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen grain">
      <nav className="flex items-center justify-between px-6 sm:px-12 py-6">
        <div className="font-display text-2xl">EagerMinds</div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary" data-testid="nav-dashboard">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost" data-testid="nav-login">Log in</Link>
              <Link href="/signup" className="btn-primary" data-testid="nav-signup">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <section className="px-6 sm:px-12 pt-16 sm:pt-24 pb-24 max-w-5xl">
        <div className="text-xs tracking-[0.2em] uppercase text-clay mb-6">
          ✦ A tiny linktree meets pocket
        </div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight mb-8">
          Save your links.<br />
          Show what you want.<br />
          <span className="text-clay italic">Keep the rest private.</span>
        </h1>
        <p className="text-base sm:text-lg text-ink/70 max-w-xl mb-10 leading-relaxed">
          Sign up, pick a handle, and start collecting bookmarks. Each one is private by
          default — flip a switch to make it public, and it shows up on your profile at
          <span className="font-mono text-ink"> /@you</span>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary" data-testid="hero-signup">Claim a handle</Link>
          <Link href="/login" className="btn-ghost" data-testid="hero-login">I have an account</Link>
        </div>
      </section>

      <section className="px-6 sm:px-12 pb-24 max-w-5xl">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            ["01", "Private by default", "Your bookmarks are yours. Only you see them — even at the API level."],
            ["02", "One public page", "Mark links public and share /@yourhandle with anyone."],
            ["03", "Real auth", "Supabase email + password, with row-level security on every row."],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6">
              <div className="text-xs font-mono text-clay mb-3">{n}</div>
              <div className="font-display text-xl mb-2">{t}</div>
              <p className="text-sm text-ink/70 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 sm:px-12 py-8 text-xs text-ink/50 border-t border-ink/10">
        EagerMinds Bookmarks · Built with Next.js, Supabase & Resend.
      </footer>
    </main>
  );
}
