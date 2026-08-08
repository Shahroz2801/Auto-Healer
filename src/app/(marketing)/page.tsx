import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Benefits } from "@/components/marketing/benefits";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { CTA } from "@/components/marketing/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
