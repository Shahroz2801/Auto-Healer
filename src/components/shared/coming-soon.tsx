import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function ComingSoonPage({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <EmptyState icon={icon} title="Coming soon" description={description} />
    </div>
  );
}
