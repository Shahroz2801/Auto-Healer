import { BarChart3 } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      icon={BarChart3}
      title="Analytics"
      description="Traffic, conversion, and health-score trend charts across your projects are on the roadmap."
    />
  );
}
