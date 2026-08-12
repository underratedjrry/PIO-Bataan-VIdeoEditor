import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computePerformanceStats } from "@/lib/tasks/stats";
import { generateAlgorithmicNarrative } from "@/lib/tasks/narrative";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const stats = await computePerformanceStats(supabase, user.id);
  const narrative = generateAlgorithmicNarrative(profile.full_name, stats);

  const { data: cached, error } = await supabase
    .from("insights_cache")
    .upsert({
      user_id: user.id,
      generated_at: new Date().toISOString(),
      summary: stats,
      narrative,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(cached);
}
