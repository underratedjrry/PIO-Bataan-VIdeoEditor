import type { Segment } from "@/types/database";
import { SEGMENT_LABELS } from "./constants";

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

function topEntry(counts: Record<string, number>): [string, number] | null {
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a));
}

// Deterministic, rule-based analysis of a user's task stats - no external AI
// call. Mirrors the shape of narrative insights (throughput, concerning
// patterns, recommendations) but is computed purely from the numbers.
export function generateAlgorithmicNarrative(userName: string, stats: PerformanceStats): string {
  if (stats.totalTasks === 0) {
    return `${userName}, you don't have any assigned tasks yet. Once tasks are assigned to you, this page will break down your completion rate, turnaround time, and workload balance, with recommendations based on the numbers.`;
  }

  const observations: string[] = [];
  const completionPct = Math.round(stats.completionRate * 100);
  const overdueRate = stats.overdueTasks / stats.totalTasks;

  if (completionPct >= 75) {
    observations.push(
      `You've completed ${stats.completedTasks} of your ${stats.totalTasks} assigned tasks (${completionPct}%), a strong completion rate.`,
    );
  } else if (completionPct >= 40) {
    observations.push(
      `You've completed ${stats.completedTasks} of your ${stats.totalTasks} assigned tasks (${completionPct}%) - a moderate pace with room to close out more of your active workload.`,
    );
  } else {
    observations.push(
      `You've completed ${stats.completedTasks} of your ${stats.totalTasks} assigned tasks (${completionPct}%), which is on the low side - most of your work is still open.`,
    );
  }

  if (stats.avgTurnaroundHours !== null) {
    const days = stats.avgTurnaroundHours / 24;
    observations.push(
      days >= 1
        ? `Completed tasks take you about ${days.toFixed(1)} days on average from creation to done.`
        : `Completed tasks take you about ${Math.round(stats.avgTurnaroundHours)} hours on average from creation to done.`,
    );
  }

  if (stats.overdueTasks === 0) {
    observations.push("You have no overdue tasks right now - due dates are well under control.");
  } else if (overdueRate < 0.15) {
    observations.push(
      `You have ${stats.overdueTasks} overdue task${stats.overdueTasks === 1 ? "" : "s"}, a small fraction of your workload - worth clearing but not a pattern yet.`,
    );
  } else {
    observations.push(
      `${stats.overdueTasks} of your ${stats.totalTasks} tasks (${Math.round(overdueRate * 100)}%) are overdue - that's a meaningful chunk of your workload falling behind schedule.`,
    );
  }

  const topSegment = topEntry(stats.bySegment);
  if (topSegment && stats.totalTasks >= 4) {
    const [segmentKey, count] = topSegment;
    const share = count / stats.totalTasks;
    if (share >= 0.5) {
      const label = SEGMENT_LABELS[segmentKey as Segment] ?? segmentKey;
      observations.push(
        `Over half of your tasks (${count} of ${stats.totalTasks}) are in ${label} - your workload is fairly concentrated in one stage.`,
      );
    }
  }

  const urgentCount = stats.byPriority.urgent ?? 0;
  if (urgentCount > 0) {
    observations.push(
      `You currently have ${urgentCount} urgent-priority task${urgentCount === 1 ? "" : "s"} - those should take precedence over lower-priority work.`,
    );
  }

  const recommendations: string[] = [];
  if (overdueRate >= 0.15) {
    recommendations.push(
      "Triage your overdue tasks first - clearing or renegotiating their due dates will do the most to improve your numbers.",
    );
  }
  if (completionPct < 40 && stats.totalTasks >= 3) {
    recommendations.push(
      "Consider closing out a few in-progress tasks before picking up new ones, to convert active work into finished output.",
    );
  }
  if (urgentCount > 0) {
    recommendations.push(
      "Handle urgent-priority tasks before medium/low ones to avoid them slipping into overdue.",
    );
  }
  if (recommendations.length === 0) {
    recommendations.push("Keep up the current pace - your workload looks well-managed.");
  }

  const recommendationText = recommendations.map((r) => `- ${r}`).join("\n");

  return `${userName}, here's where things stand: ${observations.join(" ")}\n\nRecommendations:\n${recommendationText}`;
}
