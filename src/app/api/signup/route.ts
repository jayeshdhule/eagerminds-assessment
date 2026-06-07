import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/resend";
import { isValidEmail, isValidHandle, isValidPassword } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, password, handle } = body as {
    email?: string; password?: string; handle?: string;
  };

  if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!isValidPassword(password)) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  if (!isValidHandle(handle)) return NextResponse.json({ error: "Handle must be 3–20 chars (letters, numbers, _)" }, { status: 400 });

  const admin = createAdminClient();

  // Case-insensitive uniqueness check
  const { data: taken, error: takenErr } = await admin
    .from("profiles")
    .select("id")
    .ilike("handle", handle)
    .maybeSingle();
  if (takenErr) return NextResponse.json({ error: takenErr.message }, { status: 500 });
  if (taken) return NextResponse.json({ error: "Handle is already taken" }, { status: 409 });

  // Create the user via the request-bound client so a session cookie is set on response.
  const supabase = createClient();
  const { data: signUp, error: signErr } = await supabase.auth.signUp({
    email, password,
    options: {
      // We send our own welcome via Resend; this is the fallback redirect URL.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard`,
    },
  });
  if (signErr || !signUp.user) {
    return NextResponse.json({ error: signErr?.message || "Sign up failed" }, { status: 400 });
  }

  // Insert the profile row using the service role (still safe — we just verified handle uniqueness
  // and we own the user id from signUp).
  const { error: profErr } = await admin.from("profiles").insert({
    id: signUp.user.id,
    handle,
    email,
  });
  if (profErr) {
    // Best-effort cleanup so the user can try again with a different handle.
    await admin.auth.admin.deleteUser(signUp.user.id);
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  // Send welcome email (non-blocking for the response — but await so we can log errors).
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  await sendWelcomeEmail({ to: email, handle, appUrl }).catch((e) =>
    console.error("[signup] welcome email failed", e)
  );

  return NextResponse.json({ ok: true, handle });
}
