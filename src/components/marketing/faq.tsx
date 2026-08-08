import { Container, SectionHeading } from "@/components/marketing/container";
import { Reveal } from "@/components/shared/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Does HealSite AI edit my production site directly?",
    answer:
      "No. AI-generated fixes are applied to an isolated sandbox/preview build first. Nothing touches your live site until you review the diff and explicitly apply or open a pull request.",
  },
  {
    question: "What can I import?",
    answer:
      "A live URL, a ZIP or folder upload, or a GitHub/GitLab/Bitbucket repository. We also support WordPress and Shopify connections. HealSite AI auto-detects your framework — React, Next.js, Vue, Laravel, Django, and 25+ others.",
  },
  {
    question: "What AI model powers the fixes?",
    answer:
      "Gemini is the default provider today. The AI layer is built behind a provider-agnostic interface, so support for other models (OpenAI, Claude, Grok, DeepSeek, or self-hosted) can be added without changing how scans or fixes work.",
  },
  {
    question: "How does monitoring work?",
    answer:
      "Once a project is connected, you can schedule hourly, daily, weekly, or monthly checks. We alert you by email, Slack, Discord, or Telegram when something breaks — a new bug, a broken link, an expiring SSL cert, or a performance drop.",
  },
  {
    question: "What happens to my credits?",
    answer:
      "Scans, AI fixes, chat messages, and report generation each consume credits from your plan's monthly allowance. Unused credits don't carry over; you can always purchase more or upgrade your plan.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There's no long-term contract on any plan. Cancel from Billing in your dashboard and you'll keep access until the end of your current billing period.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          align="left"
        />

        <Reveal>
          <Accordion multiple={false}>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  );
}
