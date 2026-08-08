import { Search } from "lucide-react";
import { CategoryInsightsPage } from "@/features/insights/category-insights";

export const metadata = { title: "SEO" };

export default function SeoPage() {
  return (
    <CategoryInsightsPage
      category="SEO"
      scoreKey="seoScore"
      title="SEO"
      description="Metadata, structured data, and crawlability issues across every project."
      icon={Search}
    />
  );
}
