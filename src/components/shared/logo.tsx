import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

export function Logo({
  size = 32,
  textClassName,
  showText = true,
}: {
  size?: number;
  textClassName?: string;
  showText?: boolean;
}) {
  return (
    <>
      <Image
        src="/logo-icon.png"
        alt={siteConfig.name}
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
      {showText && (
        <span className={cn("font-semibold tracking-tight", textClassName)}>
          {siteConfig.name}
        </span>
      )}
    </>
  );
}
