import { ShieldCheck } from "lucide-react";
import { CategoryInsightsPage } from "@/features/insights/category-insights";

export const metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <CategoryInsightsPage
      category="SECURITY"
      scoreKey="securityScore"
      title="Security"
      description="Vulnerabilities, insecure headers, and exposure risks across every project."
      icon={ShieldCheck}
    />
  );
}
