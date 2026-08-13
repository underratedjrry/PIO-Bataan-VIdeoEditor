import { Modal } from "@/components/Modal";
import { TaskDetailContent } from "@/components/TaskDetailContent";

export default async function TaskModal({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  return (
    <Modal>
      <TaskDetailContent id={id} mode={mode} />
    </Modal>
  );
}
