import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary),transparent_82%),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground),transparent_96%)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground),transparent_96%)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />

      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo />
      </Link>

      <div className="w-full max-w-sm">{children}</div>

      <p className="mt-8 max-w-xs text-center text-xs text-muted-foreground">
        By continuing you agree to HealSite AI&apos;s Terms of Service and
        Privacy Policy.
      </p>
    </div>
  );
}
