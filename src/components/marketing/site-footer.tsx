import Link from "next/link";
import { Container } from "@/components/marketing/container";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/config/site";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Assistant", href: "/assistant" },
    { label: "Monitoring", href: "/monitoring" },
    { label: "Integrations", href: "/integrations" },
  ],
  Company: [
    { label: "Sign in", href: "/sign-in" },
    { label: "Create account", href: "/sign-up" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-12 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={28} />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="flex flex-col gap-3">
              <h4 className="text-sm font-medium">{heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
          <span>Built with Next.js, Prisma, and Gemini.</span>
        </div>
      </Container>
    </footer>
  );
}
