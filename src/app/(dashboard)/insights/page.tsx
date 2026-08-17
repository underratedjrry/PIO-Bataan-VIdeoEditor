import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { computePerformanceStats } from "@/lib/tasks/stats";
import { generateAlgorithmicNarrative, type PerformanceStats } from "@/lib/tasks/narrative";
import { InsightsCharts } from "@/components/InsightsCharts";
import { RegenerateInsightsButton } from "@/components/RegenerateInsightsButton";
import { formatPHDateTime } from "@/lib/ph-time";

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
    const narrative = generateAlgorithmicNarrative(profile.full_name, stats);
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
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Performance Insights
          </h1>
          {cached && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last analyzed {formatPHDateTime(cached.generated_at)}
            </p>
          )}
        </div>
        <RegenerateInsightsButton />
      </div>

      <InsightsCharts stats={stats} />

      <div className="max-w-2xl rounded-none border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Performance Analysis
        </h2>
        <p className="whitespace-pre-line">{cached?.narrative ?? "No analysis yet."}</p>
      </div>
    </div>
  );
}
