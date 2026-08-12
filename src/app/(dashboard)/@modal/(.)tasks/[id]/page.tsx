import { Modal } from "@/components/Modal";
import { TaskDetailContent } from "@/components/TaskDetailContent";

export default async function TaskModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Modal>
      <TaskDetailContent id={id} />
    </Modal>
  );
}
