import { Link2, ScanLine, SplitSquareVertical, ShieldCheck } from "lucide-react";
import { Container, SectionHeading } from "@/components/marketing/container";
import { Reveal } from "@/components/shared/reveal";

const steps = [
  {
    icon: Link2,
    step: "01",
    title: "Import your project",
    description:
      "Paste a URL, upload a ZIP, or connect GitHub/GitLab/Bitbucket. HealSite AI auto-detects your framework and stack.",
  },
  {
    icon: ScanLine,
    step: "02",
    title: "AI scans everything",
    description:
      "SEO, performance, accessibility, security, and code quality are analyzed across every file — not just the homepage.",
  },
  {
    icon: SplitSquareVertical,
    step: "03",
    title: "Review the healed preview",
    description:
      "See a generated fix, its diff, and estimated impact. Compare original vs. healed in a live split-screen preview.",
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "Apply, deploy, and monitor",
    description:
      "Ship with one click to your host of choice, then let continuous monitoring catch regressions before your users do.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="How it works"
          title="From broken to healed in four steps"
          description="No guesswork, no risky direct edits to production — every fix is generated, previewed, and approved by you."
        />

        <div className="relative grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute top-9 right-0 left-0 hidden h-px bg-border lg:block"
          />
          {steps.map((step, index) => (
            <Reveal key={step.step} delay={index * 0.08}>
              <div className="relative flex flex-col items-start gap-4">
                <div className="relative z-10 flex size-[72px] flex-col items-center justify-center gap-0.5 rounded-2xl border border-border bg-card shadow-sm">
                  <step.icon className="size-5 text-primary" />
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
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
