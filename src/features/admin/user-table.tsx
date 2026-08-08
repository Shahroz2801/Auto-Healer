"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus } from "lucide-react";
import type { GlobalRole, PlanTier } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { adjustUserCreditsAction, setUserRoleAction } from "./actions";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: GlobalRole;
  credits: number;
  organizationName: string | null;
  plan: PlanTier | null;
};

const ROLES: GlobalRole[] = ["USER", "ADMIN", "SUPER_ADMIN"];

function UserRow({
  user,
  currentUserId,
  canGrantSuperAdmin,
}: {
  user: AdminUserRow;
  currentUserId: string;
  canGrantSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = React.useState("50");
  const [pending, startTransition] = React.useTransition();

  function adjust(sign: 1 | -1) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a positive amount");
      return;
    }
    startTransition(async () => {
      try {
        await adjustUserCreditsAction(user.id, sign * value);
        toast.success(sign > 0 ? "Credits added" : "Credits removed");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to adjust credits");
      }
    });
  }

  function changeRole(role: string | null) {
    if (!role) return;
    startTransition(async () => {
      try {
        await setUserRoleAction(user.id, role as GlobalRole);
        toast.success("Role updated");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update role");
      }
    });
  }

  const isSelf = user.id === currentUserId;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-foreground">{user.name ?? "—"}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">{user.organizationName ?? "—"}</TableCell>
      <TableCell>
        <Badge variant="outline">{user.plan ?? "FREE"}</Badge>
      </TableCell>
      <TableCell>
        <Select value={user.role} onValueChange={changeRole} disabled={pending || isSelf}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem
                key={role}
                value={role}
                disabled={role === "SUPER_ADMIN" && !canGrantSuperAdmin}
              >
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right tabular-nums">{user.credits.toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1.5">
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 w-20"
            disabled={pending}
          />
          <Button
            size="icon"
            variant="outline"
            className="size-8"
            disabled={pending}
            onClick={() => adjust(-1)}
            aria-label="Remove credits"
          >
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Minus className="size-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-8"
            disabled={pending}
            onClick={() => adjust(1)}
            aria-label="Add credits"
          >
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AdminUserTable({
  users,
  currentUserId,
  canGrantSuperAdmin,
}: {
  users: AdminUserRow[];
  currentUserId: string;
  canGrantSuperAdmin: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Workspace</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Credits</TableHead>
          <TableHead className="text-right">Adjust</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            currentUserId={currentUserId}
            canGrantSuperAdmin={canGrantSuperAdmin}
          />
        ))}
      </TableBody>
    </Table>
  );
}
