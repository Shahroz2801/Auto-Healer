export const siteConfig = {
  name: "HealSite AI",
  tagline: "Your AI Website Doctor",
  description:
    "Scan, analyze, repair, optimize, and monitor any website or codebase with AI — all in one platform.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export type PricingPlan = {
  id: "free" | "starter" | "pro" | "business" | "enterprise";
  name: string;
  price: number | "custom";
  period: "mo" | "once";
  description: string;
  credits: number | "unlimited";
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "mo",
    description: "Try HealSite AI on a couple of small projects.",
    credits: 100,
    features: [
      "2 projects",
      "Manual scans (SEO, Performance, Accessibility)",
      "AI chat assistant (limited)",
      "Community support",
    ],
    cta: "Start Free",
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    period: "mo",
    description: "For freelancers healing client sites.",
    credits: 1000,
    features: [
      "10 projects",
      "All scan categories",
      "AI Auto-Heal one-click fixes",
      "Weekly monitoring",
      "Email alerts",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    period: "mo",
    description: "For growing teams shipping fast.",
    credits: 5000,
    features: [
      "Unlimited projects",
      "Live split-screen preview",
      "GitHub/GitLab/Bitbucket sync",
      "Hourly monitoring",
      "Slack + Discord alerts",
      "PDF/DOCX reports",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: 199,
    period: "mo",
    description: "For agencies managing many sites.",
    credits: 20000,
    features: [
      "Everything in Pro",
      "Multi-workspace organizations",
      "Role-based access control",
      "Priority AI queue",
      "API access",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "custom",
    period: "mo",
    description: "For platforms with custom compliance needs.",
    credits: "unlimited",
    features: [
      "Everything in Business",
      "SSO / SAML",
      "Dedicated infrastructure",
      "Custom AI model routing",
      "Uptime SLA",
    ],
    cta: "Book Demo",
  },
];
