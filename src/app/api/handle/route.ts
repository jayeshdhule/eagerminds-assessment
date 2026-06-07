import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isValidHandle } from "@/lib/validators";

// Lightweight availability check used by the signup form (optional).
export async function GET(req: Request) {
  const handle = new URL(req.url).searchParams.get("handle") || "";
  if (!isValidHandle(handle)) return NextResponse.json({ available: false, reason: "invalid" });
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id").ilike("handle", handle).maybeSingle();
  return NextResponse.json({ available: !data });
}
