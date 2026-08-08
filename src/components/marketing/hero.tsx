"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/marketing/container";
import { HeroPreview } from "@/components/marketing/hero-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary),transparent_85%),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground),transparent_96%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground),transparent_96%)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)]"
      />

      <Container className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            Powered by Gemini · Scan, heal, and monitor in one place
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Your{" "}
            <span className="bg-gradient-to-r from-primary to-[var(--brand-glow)] bg-clip-text text-transparent">
              AI Website Doctor
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-xl text-balance text-lg text-muted-foreground"
          >
            Scan, analyze, repair, optimize, and monitor any website or
            codebase — all in one AI-powered platform. Find what&apos;s
            broken, preview the fix, and ship it with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link href="/sign-up">
              <Button size="lg" className="h-11 gap-2 px-6">
                Start Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="h-11 px-6">
                Book Demo
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="ghost" className="h-11 gap-2 px-4">
                <PlayCircle className="size-4" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs text-muted-foreground"
          >
            No credit card required · 100 free credits · Cancel anytime
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <HeroPreview />
        </motion.div>
      </Container>
    </section>
  );
}
