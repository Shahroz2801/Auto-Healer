import { Radar } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon";

export const metadata = { title: "Monitoring" };

export default function MonitoringPage() {
  return (
    <ComingSoonPage
      icon={Radar}
      title="Monitoring"
      description="Scheduled hourly-to-monthly checks for new bugs, broken links, and SSL expiry are on the roadmap."
    />
  );
}
