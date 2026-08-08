"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bot, Loader2, Send, User } from "lucide-react";
import type { ChatMessage } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sendChatMessageAction } from "@/features/ai/actions";

export function ChatPanel({
  chatId,
  messages,
  projectName,
}: {
  chatId: string;
  messages: ChatMessage[];
  projectName?: string;
}) {
  const router = useRouter();
  const [input, setInput] = React.useState("");
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(null);
  const [sending, startTransition] = React.useTransition();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pendingMessage]);

  function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setPendingMessage(text);
    startTransition(async () => {
      try {
        await sendChatMessageAction(chatId, text);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send message");
      } finally {
        setPendingMessage(null);
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      {projectName && (
        <div className="border-b border-border px-6 py-3 text-sm text-muted-foreground">
          Discussing <span className="font-medium text-foreground">{projectName}</span>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && !pendingMessage && (
            <p className="text-center text-sm text-muted-foreground">
              Ask about performance, SEO, security, or accessibility — for this project or in general.
            </p>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role} content={message.content} />
          ))}

          {pendingMessage && (
            <>
              <ChatBubble role="USER" content={pendingMessage} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Thinking...
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="max-h-40 min-h-10 flex-1 resize-none"
          />
          <Button size="icon" disabled={sending || !input.trim()} onClick={handleSend}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "USER";
  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
}
