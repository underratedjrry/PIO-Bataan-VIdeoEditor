"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SendIcon } from "@/components/icons";
import type { ChatMessage } from "@/lib/ai-assist";

export function AiAssistChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function send() {
    const text = input.trim();
    if (!text) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to get a response");
        setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[320px] flex-col gap-3 rounded-none border border-slate-200 p-4 dark:border-slate-800">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Ask for help drafting task descriptions, captions, summaries, or anything else.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-none px-3 py-2 text-sm whitespace-pre-line ${
              m.role === "user"
                ? "ml-auto bg-[#0036AF] text-white"
                : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            }`}
          >
            {m.content}
          </div>
        ))}
        {isPending && <p className="text-sm text-slate-400">Thinking...</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Type a message..."
          className="form-input flex-1 resize-none"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          aria-label="Send"
          title="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#0036AF] text-white hover:bg-[#002583] disabled:opacity-60"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
