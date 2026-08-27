"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";

function randomCode(length = 7) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// Reuses an existing short link for the same task instead of minting a new
// code every time Share is clicked. No external API - codes are generated
// and resolved entirely within our own database (see /s/[code]).
export async function getOrCreateShortLink(taskId: string, targetUrl: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("short_links")
    .select("code")
    .eq("task_id", taskId)
    .maybeSingle();

  if (existing) return existing.code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await supabase.from("short_links").insert({
      code,
      target_url: targetUrl,
      task_id: taskId,
      created_by: user.id,
    });
    if (!error) return code;
    // Unique violation on `code` - regenerate and retry; anything else, bail.
    if (error.code !== "23505") throw new Error(error.message);
  }

  throw new Error("Could not generate a short link - try again.");
}
