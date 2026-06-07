import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grain flex flex-col items-center justify-center px-6 text-center">
      <div className="text-xs tracking-[0.2em] uppercase text-clay mb-3">404</div>
      <h1 className="font-display text-5xl mb-4">Nothing here.</h1>
      <p className="text-ink/60 mb-8 max-w-sm">
        That handle doesn't exist, or the page moved.
      </p>
      <Link href="/" className="btn-primary">Back home</Link>
    </main>
  );
}
