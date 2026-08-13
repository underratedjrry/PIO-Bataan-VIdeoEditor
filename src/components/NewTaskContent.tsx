import { TaskForm } from "@/components/TaskForm";
import { createClient } from "@/lib/supabase/server";
import { createTask } from "@/lib/tasks/actions";

export async function NewTaskContent() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: outputTypes }, { data: writers }, { data: segments }] =
    await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("output_types").select("*").order("name"),
      supabase.from("writers").select("*").order("name"),
      supabase.from("segments").select("*").order("name"),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">New Task</h1>
      <TaskForm
        profiles={profiles ?? []}
        outputTypes={outputTypes ?? []}
        writers={writers ?? []}
        segments={segments ?? []}
        onSubmit={createTask}
        submitLabel="Create Task"
      />
    </div>
  );
}
