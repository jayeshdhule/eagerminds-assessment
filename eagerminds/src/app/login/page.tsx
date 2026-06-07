"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Login failed");
        return;
      }
      router.push(redirect);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" data-testid="login-form">
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} className="input" data-testid="login-email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)} className="input" data-testid="login-password" />
      </div>
      {err && (
        <div className="text-sm text-clay bg-clay/10 border border-clay/20 rounded-md px-3 py-2" data-testid="login-error">
          {err}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="login-submit">
        {loading ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grain flex flex-col">
      <nav className="px-6 sm:px-12 py-6">
        <Link href="/" className="font-display text-2xl">EagerMinds</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-xs tracking-[0.2em] uppercase text-clay mb-3">Welcome back</div>
          <h1 className="font-display text-4xl mb-8 leading-tight">Log in.</h1>
          <Suspense fallback={<div className="text-ink/40">Loading…</div>}>
            <LoginForm />
          </Suspense>
          <p className="text-sm text-ink/60 mt-6">
            No account? <Link href="/signup" className="text-clay underline">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
