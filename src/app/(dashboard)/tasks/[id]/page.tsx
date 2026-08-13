import { TaskDetailContent } from "@/components/TaskDetailContent";

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl">
      <TaskDetailContent id={id} mode={mode} />
    </div>
  );
}
