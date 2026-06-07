export const HANDLE_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidHandle(h: unknown): h is string {
  return typeof h === "string" && HANDLE_RE.test(h);
}

export function isValidEmail(e: unknown): e is string {
  return typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function isValidPassword(p: unknown): p is string {
  return typeof p === "string" && p.length >= 8 && p.length <= 200;
}

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
