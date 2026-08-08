import { Gauge } from "lucide-react";
import { CategoryInsightsPage } from "@/features/insights/category-insights";

export const metadata = { title: "Performance" };

export default function PerformancePage() {
  return (
    <CategoryInsightsPage
      category="PERFORMANCE"
      scoreKey="performanceScore"
      title="Performance"
      description="Core Web Vitals, bundle size, and load-time issues across every project."
      icon={Gauge}
    />
  );
}
