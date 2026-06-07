import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("handle,email")
    .eq("id", user.id)
    .single();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("id,title,url,is_public,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      initial={bookmarks || []}
      handle={profile?.handle || ""}
      email={profile?.email || user.email || ""}
    />
  );
}
