import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { createTask } from "@/lib/tasks/actions";
import { TaskForm } from "@/components/TaskForm";

export default async function NewTaskPage() {
  const { profile } = await getCurrentProfile();
  if (profile.role === "viewer") redirect("/tasks");

  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">New Task</h1>
      <TaskForm profiles={profiles ?? []} onSubmit={createTask} submitLabel="Create Task" />
    </div>
  );
}
