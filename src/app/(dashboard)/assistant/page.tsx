import { Bot } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "AI Assistant" };

export default function AssistantIndexPage() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        icon={Bot}
        title="Ask HealSite AI anything"
        description="Start a new chat to ask about a specific project's scan results, or general questions about SEO, performance, security, and accessibility."
      />
    </div>
  );
}
