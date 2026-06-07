import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeUrl } from "@/lib/validators";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t || t.length > 200) return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    patch.title = t;
  }
  if (typeof body.url === "string") {
    const u = normalizeUrl(body.url);
    if (!u) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    patch.url = u;
  }
  if (typeof body.is_public === "boolean") patch.is_public = body.is_public;
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  // RLS ensures the user can only update their own rows.
  const { data, error } = await supabase
    .from("bookmarks")
    .update(patch)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id,title,url,is_public,created_at,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ bookmark: data });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error, count } = await supabase
    .from("bookmarks")
    .delete({ count: "exact" })
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!count) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
