import { Zap } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { pricingPlans } from "@/lib/config/site";
import { PlanPicker } from "@/features/billing/plan-picker";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;

  const [subscription, ledger] = await Promise.all([
    org ? db.subscription.findUnique({ where: { organizationId: org.id } }) : null,
    db.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const currentPlanId = subscription?.plan.toLowerCase() ?? "free";
  const currentPlan = pricingPlans.find((p) => p.id === currentPlanId);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Your plan, credits, and usage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current plan</CardTitle>
              <Badge>{subscription?.status ?? "TRIALING"}</Badge>
            </div>
            <CardDescription>
              {currentPlan?.name ?? "Free"} · Plan changes are instant in this deployment —
              no payment processor is connected.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Credits remaining
            </CardTitle>
            <CardDescription className="text-2xl font-semibold tabular-nums text-foreground">
              {user.credits.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Plans</h2>
        <PlanPicker currentPlanId={currentPlanId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage history</CardTitle>
          <CardDescription>Recent credit activity across scans, fixes, and reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {ledger.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No activity yet"
              description="Once you run scans or generate AI fixes, credit usage will show up here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">
                      {entry.type.replace("_", " ").toLowerCase()}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${entry.amount < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                    >
                      {entry.amount > 0 ? "+" : ""}
                      {entry.amount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{entry.balanceAfter}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
