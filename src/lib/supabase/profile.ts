import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";
import type { Profile } from "@/types/database";

// Cached per-request so layout.tsx and page.tsx can both call this without
// issuing duplicate auth/profile round trips.
export const getCurrentProfile = cache(async (): Promise<{
  user: User;
  profile: Profile;
}> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return { user, profile };
});
