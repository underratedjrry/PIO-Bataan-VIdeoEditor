import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are AI Assist, embedded in the PIO Bataan Video Editing PMIS. You help staff " +
  "with things like drafting task descriptions, summarizing editorial remarks, " +
  "brainstorming captions/titles for AVPs, Reels, and social posts, and general " +
  "writing help. Keep answers concise and practical.";

export async function askAssistant(messages: ChatMessage[]): Promise<string> {
  if (!anthropic) {
    return "AI Assist is unavailable - set ANTHROPIC_API_KEY to enable this feature.";
  }
  if (messages.length === 0) return "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "No response generated.";
}
