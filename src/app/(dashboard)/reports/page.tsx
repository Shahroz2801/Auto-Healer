import { FileText } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <ComingSoonPage
      icon={FileText}
      title="Reports"
      description="Exportable PDF, DOCX, HTML, JSON, and CSV scan reports are on the roadmap."
    />
  );
}
