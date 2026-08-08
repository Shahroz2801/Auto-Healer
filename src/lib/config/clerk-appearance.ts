import type { ComponentProps } from "react";
import type { SignIn } from "@clerk/nextjs";

/**
 * Shared Clerk styling so sign-in/sign-up match the rest of the app's
 * shadcn/Tailwind theme instead of Clerk's default look. Typed off the
 * `SignIn` component itself (`SignUp` takes the same `appearance` shape)
 * since `@clerk/types` isn't a direct dependency.
 */
export const clerkAppearance: NonNullable<ComponentProps<typeof SignIn>["appearance"]> = {
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--card)",
    colorForeground: "var(--card-foreground)",
    colorMutedForeground: "var(--muted-foreground)",
    colorInput: "var(--background)",
    colorInputForeground: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorBorder: "var(--border)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none border border-border rounded-xl",
    card: "w-full bg-card border-none shadow-none p-6",
    headerTitle: "text-lg font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border border-border hover:bg-muted transition-colors",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-foreground",
    formFieldInput:
      "border-border bg-background focus:border-ring focus:ring-ring/50",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm normal-case",
    footerActionLink: "text-primary hover:text-primary/80",
    identityPreviewEditButtonIcon: "text-primary",
  },
};
