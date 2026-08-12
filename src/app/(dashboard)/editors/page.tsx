import { createClient } from "@/lib/supabase/server";
import { computeAllEditorStats, type EditorStats } from "@/lib/tasks/editor-stats";
import { EditorCard } from "@/components/EditorCard";

const EMPTY_STATS: EditorStats = {
  totalTasks: 0,
  completed: 0,
  ongoing: 0,
  upcoming: 0,
  avgCompletionHours: null,
};

export default async function EditorsPage() {
  const supabase = await createClient();
  const [{ data: profiles }, statsByUser] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    computeAllEditorStats(supabase),
  ]);

  const editors = (profiles ?? []).filter((p) => p.role !== "viewer");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Video Editors</h1>

      {editors.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No editors yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {editors.map((editor) => (
            <EditorCard
              key={editor.id}
              profile={editor}
              stats={statsByUser[editor.id] ?? EMPTY_STATS}
            />
          ))}
        </div>
      )}
    </div>
  );
}
