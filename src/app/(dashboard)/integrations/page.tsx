import { Plug } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon";

export const metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <ComingSoonPage
      icon={Plug}
      title="Integrations"
      description="Connecting GitHub, GitLab, Slack, Google Search Console, and more is on the roadmap."
    />
  );
}
