import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { Modal } from "@/components/Modal";
import { TaskDetailContent } from "@/components/TaskDetailContent";
import { NewTaskContent } from "@/components/NewTaskContent";

export default async function TaskModal({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;

  // This slot's own route table only has `[id]`, so on a soft (client-side)
  // navigation `/tasks/new` matches here as id="new" instead of falling
  // through to the sibling literal page - a hard refresh bypasses
  // interception entirely, which is why it only "worked after refresh".
  // Handling it explicitly turns New Task into a proper modal too.
  if (id === "new") {
    const { profile } = await getCurrentProfile();
    if (profile.role === "viewer") redirect("/tasks");
    return (
      <Modal>
        <NewTaskContent />
      </Modal>
    );
  }

  const { mode } = await searchParams;
  return (
    <Modal>
      <TaskDetailContent id={id} mode={mode} />
    </Modal>
  );
}
