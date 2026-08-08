import { ShieldCheck, Timer, GitPullRequestArrow, Layers } from "lucide-react";
import { Container, SectionHeading } from "@/components/marketing/container";
import { Reveal } from "@/components/shared/reveal";
import { AnimatedCounter } from "@/components/shared/animated-counter";

const stats = [
  { value: 50, suffix: "+", label: "Automated checks per scan" },
  { value: 15, suffix: "", label: "Supported import methods" },
  { value: 30, suffix: "+", label: "Framework stacks detected" },
  { value: 100, suffix: "%", label: "Fixes previewed before apply" },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Nothing touches production directly",
    description:
      "AI fixes are generated as diffs and applied to an isolated sandbox first. You approve before anything ships.",
  },
  {
    icon: Timer,
    title: "Minutes, not sprints",
    description:
      "What used to take a dev team a full sprint — auditing SEO, perf, a11y, and security — runs as one scan.",
  },
  {
    icon: GitPullRequestArrow,
    title: "Real diffs, real pull requests",
    description:
      "Every fix is reviewable code, not a black box. Accept, reject, or open a PR straight from the dashboard.",
  },
  {
    icon: Layers,
    title: "Understands your whole stack",
    description:
      "Not just HTML — components, dependencies, API calls, build config, and deployment setup all factor into fixes.",
  },
];

export function Benefits() {
  return (
    <section className="border-y border-border bg-muted/30 py-24 sm:py-32">
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow="Why HealSite AI"
          title="Built for teams who ship, not just audit"
          description="Most scanners hand you a PDF of problems. HealSite AI hands you the fix — reviewed, previewed, and ready to merge."
        />

        <Reveal>
          <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card px-6 py-8 shadow-sm sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.05}>
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <benefit.icon className="size-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
