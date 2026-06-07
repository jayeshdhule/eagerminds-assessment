import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeUrl } from "@/lib/validators";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // RLS will already restrict to the caller's rows, but we also filter explicitly.
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id,title,url,is_public,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmarks: data });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const urlRaw = typeof body.url === "string" ? body.url : "";
  const is_public = !!body.is_public;

  if (!title || title.length > 200) return NextResponse.json({ error: "Title required (≤200 chars)" }, { status: 400 });
  const url = normalizeUrl(urlRaw);
  if (!url) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, title, url, is_public })
    .select("id,title,url,is_public,created_at,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmark: data });
}
