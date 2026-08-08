"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createChatAction } from "@/features/ai/actions";

type ChatSummary = { id: string; title: string; updatedAt: Date };
type ProjectSummary = { id: string; name: string };

export function ChatSidebar({
  chats,
  projects,
}: {
  chats: ChatSummary[];
  projects: ProjectSummary[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border">
      <form action={createChatAction} className="flex flex-col gap-2 border-b border-border p-3">
        {projects.length > 0 && (
          <Select name="projectId">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No project (general chat)" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button type="submit" className="w-full gap-2">
          <MessageSquarePlus className="size-4" />
          New chat
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          <nav className="flex flex-col gap-0.5">
            {chats.map((chat) => {
              const active = pathname === `/assistant/${chat.id}`;
              return (
                <Link
                  key={chat.id}
                  href={`/assistant/${chat.id}`}
                  className={cn(
                    "truncate rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {chat.title}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
