"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import type { PlanTier } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateRedeemCodeAction } from "./actions";

const PAID_PLANS: PlanTier[] = ["STARTER", "PRO", "BUSINESS", "ENTERPRISE"];

export type RedeemCodeRow = {
  id: string;
  code: string;
  plan: PlanTier;
  createdAt: Date;
  redeemedByEmail: string | null;
};

export function RedeemCodesPanel({ codes }: { codes: RedeemCodeRow[] }) {
  const router = useRouter();
  const [plan, setPlan] = React.useState<PlanTier>("STARTER");
  const [pending, startTransition] = React.useTransition();

  function generate() {
    startTransition(async () => {
      try {
        const code = await generateRedeemCodeAction(plan);
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(code).catch(() => {});
        }
        toast.success(`Generated ${code} (copied to clipboard)`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to generate code");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select value={plan} onValueChange={(value) => value && setPlan(value as PlanTier)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAID_PLANS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-1.5" disabled={pending} onClick={generate}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Generate code
        </Button>
      </div>

      {codes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No codes generated yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.code}</TableCell>
                <TableCell>{c.plan}</TableCell>
                <TableCell>
                  {c.redeemedByEmail ? (
                    <Badge variant="outline">Redeemed by {c.redeemedByEmail}</Badge>
                  ) : (
                    <Badge>Available</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
