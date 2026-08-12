import { AiAssistChat } from "@/components/AiAssistChat";

export default function AiAssistPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">AI Assist</h1>
      <AiAssistChat />
    </div>
  );
}
