"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, handle }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Sign up failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grain flex flex-col">
      <nav className="px-6 sm:px-12 py-6">
        <Link href="/" className="font-display text-2xl">EagerMinds</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-xs tracking-[0.2em] uppercase text-clay mb-3">Create account</div>
          <h1 className="font-display text-4xl mb-8 leading-tight">Claim your handle.</h1>
          <form onSubmit={onSubmit} className="space-y-5" data-testid="signup-form">
            <div>
              <label className="label" htmlFor="handle">Handle</label>
              <div className="flex items-stretch">
                <span className="inline-flex items-center px-3 bg-ink/5 border border-r-0 border-ink/15 rounded-l-md text-ink/60 text-sm">@</span>
                <input
                  id="handle" name="handle" required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  pattern="[a-zA-Z0-9_]{3,20}"
                  title="3–20 chars: letters, numbers, underscore"
                  placeholder="yourname"
                  className="input rounded-l-none"
                  data-testid="signup-handle"
                />
              </div>
              <p className="text-xs text-ink/50 mt-1.5">Letters, numbers, underscore. 3–20 chars.</p>
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} className="input" data-testid="signup-email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)} className="input" data-testid="signup-password" />
              <p className="text-xs text-ink/50 mt-1.5">Min 8 characters.</p>
            </div>
            {err && (
              <div className="text-sm text-clay bg-clay/10 border border-clay/20 rounded-md px-3 py-2" data-testid="signup-error">
                {err}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="signup-submit">
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="text-sm text-ink/60 mt-6">
            Already have an account? <Link href="/login" className="text-clay underline">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
