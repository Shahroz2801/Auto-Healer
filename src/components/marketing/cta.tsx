import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/marketing/container";
import { Reveal } from "@/components/shared/reveal";

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_120%,color-mix(in_oklch,var(--primary),transparent_82%),transparent)]"
            />
            <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Give your website a check-up
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-muted-foreground sm:text-lg">
              Run your first AI scan free — no credit card required. See
              exactly what&apos;s broken and how HealSite AI would fix it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/sign-up">
                <Button size="lg" className="h-11 gap-2 px-6">
                  Start Free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="h-11 px-6">
                  See pricing
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
