import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// `type`, not `interface` - interfaces don't get the implicit index-signature
// leniency needed to satisfy `Record<string, unknown>` when this is stored
// as `insights_cache.summary` (see the note in src/types/database.ts).
export type PerformanceStats = {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgTurnaroundHours: number | null;
  byPriority: Record<string, number>;
  bySegment: Record<string, number>;
  byStatus: Record<string, number>;
};

export async function generatePerformanceNarrative(
  userName: string,
  stats: PerformanceStats,
): Promise<string> {
  if (!anthropic) {
    return "AI insights are unavailable - set ANTHROPIC_API_KEY to enable this feature.";
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `You are analyzing video editing task performance data for ${userName}. Here is a JSON summary of their tasks:

${JSON.stringify(stats, null, 2)}

Write a concise (150-250 words) performance analysis covering: overall throughput and completion rate, any concerning patterns (overdue rate, imbalance across segments/priorities), and 2-3 specific, actionable recommendations. Write directly to the user in second person, plain text (no markdown headers), encouraging but honest tone.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "No insights generated.";
}
