import { Star } from "lucide-react";
import { Container, SectionHeading } from "@/components/marketing/container";
import { Reveal } from "@/components/shared/reveal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    quote:
      "We ran our first scan expecting a report. Instead we got a pull request. That's the difference between a scanner and an actual fix.",
    name: "Priya Nair",
    role: "Lead Engineer, Northwind Labs",
    initials: "PN",
  },
  {
    quote:
      "The split-screen preview is what sold the team. Nobody has to trust a black box AI edit — you see exactly what changes before it ships.",
    name: "Marcus Webb",
    role: "Founder, Fernbridge Studio",
    initials: "MW",
  },
  {
    quote:
      "Monitoring caught an expiring SSL cert three days before it would've taken our checkout page down. That alone paid for the year.",
    name: "Elena Kovacs",
    role: "Head of Platform, Larkspur Retail",
    initials: "EK",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow="What teams say"
          title="Trusted by teams who ship fast"
        />

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <Reveal key={t.name} delay={index * 0.08}>
              <figure className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
