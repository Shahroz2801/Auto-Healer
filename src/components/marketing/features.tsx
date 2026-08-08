import {
  ScanSearch,
  Wand2,
  Columns2,
  Bot,
  Radar,
  FileBarChart,
  GitBranch,
  Rocket,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/marketing/container";
import { Reveal } from "@/components/shared/reveal";

const features = [
  {
    icon: ScanSearch,
    title: "Full-stack scanning",
    description:
      "SEO, performance, accessibility, security, and code quality — scanned across your entire project, not just the rendered HTML.",
  },
  {
    icon: Wand2,
    title: "AI Auto-Heal",
    description:
      "Every issue comes with an AI-generated explanation, severity, estimated impact, and a one-click fix you can review before applying.",
  },
  {
    icon: Columns2,
    title: "Live split-screen preview",
    description:
      "Fixes apply to an isolated sandbox first. Compare original vs. healed side-by-side across desktop, tablet, and mobile before you ship.",
  },
  {
    icon: Bot,
    title: "AI chat assistant",
    description:
      "Ask \"why is my homepage slow?\" or \"generate a sitemap.\" The assistant has memory of your specific project, not just generic advice.",
  },
  {
    icon: Radar,
    title: "Continuous monitoring",
    description:
      "Hourly to monthly checks catch new bugs, broken links, expiring SSL certs, and performance regressions before your users do.",
  },
  {
    icon: FileBarChart,
    title: "Beautiful reports",
    description:
      "Export PDF, DOCX, HTML, JSON, or CSV reports with before/after health scores, charts, and a full changelog of what was fixed.",
  },
  {
    icon: GitBranch,
    title: "Import from anywhere",
    description:
      "A live URL, a ZIP, a folder, or a GitHub/GitLab/Bitbucket repo. HealSite AI detects your framework and analyzes the whole codebase.",
  },
  {
    icon: Rocket,
    title: "One-click deploy",
    description:
      "Ship healed sites straight to Vercel, Netlify, Cloudflare, AWS, or your own server over FTP/SFTP/SSH — no context switching.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="Features"
          title="Everything a website doctor needs"
          description="One platform for the full lifecycle: find what's wrong, understand why it matters, fix it safely, and keep watching."
        />

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.05}>
              <div className="group h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mb-1.5 font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
