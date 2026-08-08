"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Mail, Ticket } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { pricingPlans, type PricingPlan } from "@/lib/config/site";
import { changePlanAction, redeemCodeAction } from "./actions";

const CONTACT_EMAIL = "shahroz.web.officials@gmail.com";

/** Opens Gmail's own compose UI pre-filled and ready to send, instead of a
 * generic `mailto:` (which just hands off to whatever mail client is set as
 * the OS default — inconsistent and easy to mistake for "not working"). */
function gmailComposeUrl(planName: string) {
  const subject = `Purchase the ${planName} plan — HealSite AI`;
  const body = `Hi,\n\nI'd like to buy the ${planName} plan for my HealSite AI workspace.\n\nThanks!`;
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: CONTACT_EMAIL,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function BuyPlanDialog({ plan }: { plan: PricingPlan }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
          />
        }
      >
        <Mail className="size-3" />
        Buy this plan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy the {plan.name} plan</DialogTitle>
          <DialogDescription>
            Purchases are handled manually over email — contact{" "}
            <span className="font-medium text-foreground">{CONTACT_EMAIL}</span> and
            we&apos;ll set up your workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <a
            href={gmailComposeUrl(plan.name)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm" })}
          >
            Buy Now
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({ plan, isCurrent }: { plan: PricingPlan; isCurrent: boolean }) {
  const router = useRouter();
  const [showCodeField, setShowCodeField] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  function switchToFree() {
    startTransition(async () => {
      try {
        await changePlanAction(plan.id);
        toast.success(`Switched to the ${plan.name} plan`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to change plan");
      }
    });
  }

  function redeem() {
    if (!code.trim()) {
      toast.error("Enter a code");
      return;
    }
    startTransition(async () => {
      try {
        const planName = await redeemCodeAction(plan.id, code);
        toast.success(`Redeemed! You're now on the ${planName} plan.`);
        setCode("");
        setShowCodeField(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to redeem code");
      }
    });
  }

  return (
    <Card className={cn(plan.highlighted && "ring-2 ring-primary/40")}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{plan.name}</CardTitle>
          {isCurrent && <Badge>Current</Badge>}
        </div>
        <CardDescription>
          {plan.price === "custom" ? "Custom" : plan.price === 0 ? "Free" : `$${plan.price}/${plan.period}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="space-y-1 text-xs text-muted-foreground">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-1.5">
              <Check className="mt-0.5 size-3 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>

        {isCurrent ? (
          <Button size="sm" variant="outline" disabled>
            Current plan
          </Button>
        ) : plan.id === "free" ? (
          <Button size="sm" disabled={pending} onClick={switchToFree}>
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : plan.cta}
          </Button>
        ) : !showCodeField ? (
          <div className="flex flex-col gap-1.5">
            <Button size="sm" className="gap-1.5" onClick={() => setShowCodeField(true)}>
              <Ticket className="size-3.5" />
              Enter code
            </Button>
            <BuyPlanDialog plan={plan} />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                className="h-8 font-mono text-xs"
                disabled={pending}
              />
              <Button size="sm" disabled={pending} onClick={redeem}>
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : "Redeem"}
              </Button>
            </div>
            <BuyPlanDialog plan={plan} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PlanPicker({ currentPlanId }: { currentPlanId: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {pricingPlans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} isCurrent={plan.id === currentPlanId} />
      ))}
    </div>
  );
}
