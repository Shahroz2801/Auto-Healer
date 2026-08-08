import { Rocket } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon";

export const metadata = { title: "Deployments" };

export default function DeploymentsPage() {
  return (
    <ComingSoonPage
      icon={Rocket}
      title="Deployments"
      description="One-click deploys to Vercel, Netlify, Cloudflare, AWS, or your own server are on the roadmap."
    />
  );
}
