import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

// Public short-link redirect - outside (dashboard), no auth. Service-role
// client since visitors here have no session, same as /share/tasks/[id].
export default async function ShortLinkRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("short_links")
    .select("target_url")
    .eq("code", code)
    .maybeSingle();

  if (!link) notFound();

  redirect(link.target_url);
}
