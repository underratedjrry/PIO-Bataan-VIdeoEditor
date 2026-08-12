import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { computePerformanceStats } from "@/lib/tasks/stats";
import { generatePerformanceNarrative, type PerformanceStats } from "@/lib/anthropic";
import { InsightsCharts } from "@/components/InsightsCharts";
import { RegenerateInsightsButton } from "@/components/RegenerateInsightsButton";

const EMPTY_STATS: PerformanceStats = {
  totalTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  completionRate: 0,
  avgTurnaroundHours: null,
  byPriority: {},
  bySegment: {},
  byStatus: {},
};

export default async function InsightsPage() {
  const { user, profile } = await getCurrentProfile();
  const supabase = await createClient();

  let { data: cached } = await supabase
    .from("insights_cache")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cached) {
    const stats = await computePerformanceStats(supabase, user.id);
    const narrative = await generatePerformanceNarrative(profile.full_name, stats);
    const { data: inserted } = await supabase
      .from("insights_cache")
      .upsert({
        user_id: user.id,
        generated_at: new Date().toISOString(),
        summary: stats,
        narrative,
      })
      .select()
      .single();
    cached = inserted;
  }

  const stats = (cached?.summary as PerformanceStats | undefined) ?? EMPTY_STATS;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Performance Insights
          </h1>
          {cached && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Last analyzed {new Date(cached.generated_at).toLocaleString()}
            </p>
          )}
        </div>
        <RegenerateInsightsButton />
      </div>

      <InsightsCharts stats={stats} />

      <div className="max-w-2xl rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          AI Analysis
        </h2>
        <p className="whitespace-pre-line">{cached?.narrative ?? "No analysis yet."}</p>
      </div>
    </div>
  );
}
