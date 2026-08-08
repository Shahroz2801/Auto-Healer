import { Accessibility } from "lucide-react";
import { CategoryInsightsPage } from "@/features/insights/category-insights";

export const metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <CategoryInsightsPage
      category="ACCESSIBILITY"
      scoreKey="accessibilityScore"
      title="Accessibility"
      description="Contrast, ARIA, and keyboard-navigation issues across every project."
      icon={Accessibility}
    />
  );
}
