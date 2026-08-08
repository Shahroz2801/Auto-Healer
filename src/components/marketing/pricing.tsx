import Link from "next/link";
import { Check } from "lucide-react";
import { Container, SectionHeading } from "@/components/marketing/container";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { pricingPlans } from "@/lib/config/site";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing that scales with you"
          description="Start free. Upgrade when you need more projects, faster monitoring, or team seats."
        />

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {pricingPlans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.05} className="lg:col-span-1">
              <div
                className={cn(
                  "flex h-full flex-col gap-6 rounded-2xl border p-6",
                  plan.highlighted
                    ? "border-primary bg-primary/[0.03] shadow-lg ring-1 ring-primary/20"
                    : "border-border bg-card shadow-sm"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold tracking-tight">{plan.name}</h3>
                  {plan.highlighted && <Badge>Most popular</Badge>}
                </div>

                <div className="flex items-baseline gap-1">
                  {plan.price === "custom" ? (
                    <span className="text-3xl font-semibold tracking-tight">
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold tracking-tight">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.period}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{plan.description}</p>

                <Link href="/sign-up" className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="flex flex-1 flex-col gap-2.5 border-t border-border pt-5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
