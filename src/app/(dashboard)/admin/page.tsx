import { notFound } from "next/navigation";
import { ShieldAlert, Users, Building2, Zap, Ticket } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserTable, type AdminUserRow } from "@/features/admin/user-table";
import { RedeemCodesPanel, type RedeemCodeRow } from "@/features/admin/redeem-codes-panel";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireDbUser();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") notFound();

  const [users, userCount, orgCount, creditTotal, redeemCodes] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        memberships: { include: { organization: { include: { subscription: true } } }, take: 1 },
      },
    }),
    db.user.count(),
    db.organization.count(),
    db.user.aggregate({ _sum: { credits: true } }),
    db.redeemCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { redeemedBy: { select: { email: true } } },
    }),
  ]);

  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    credits: u.credits,
    organizationName: u.memberships[0]?.organization.name ?? null,
    plan: u.memberships[0]?.organization.subscription?.plan ?? null,
  }));

  const codeRows: RedeemCodeRow[] = redeemCodes.map((c) => ({
    id: c.id,
    code: c.code,
    plan: c.plan,
    createdAt: c.createdAt,
    redeemedByEmail: c.redeemedBy?.email ?? null,
  }));

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, workspaces, and credits across the whole platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4" /> Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {userCount.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="size-4" /> Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {orgCount.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Zap className="size-4" /> Credits outstanding
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {(creditTotal._sum.credits ?? 0).toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="size-4 text-primary" />
            Redeem codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RedeemCodesPanel codes={codeRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUserTable
            users={rows}
            currentUserId={user.id}
            canGrantSuperAdmin={user.role === "SUPER_ADMIN"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
