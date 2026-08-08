"use client";

import { useActionState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganizationAction, type UpdateOrgState } from "@/features/settings/actions";

const initialState: UpdateOrgState = {};

export function OrganizationForm({
  defaultName,
  defaultSlug,
  disabled,
}: {
  defaultName: string;
  defaultSlug: string;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateOrganizationAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="org-name">Workspace name</Label>
        <Input
          id="org-name"
          name="name"
          defaultValue={defaultName}
          disabled={disabled}
          maxLength={80}
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-slug">Workspace slug</Label>
        <Input
          id="org-slug"
          name="slug"
          defaultValue={defaultSlug}
          disabled={disabled}
          maxLength={60}
          required
        />
        {state.fieldErrors?.slug && (
          <p className="text-xs text-destructive">{state.fieldErrors.slug[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="size-4" />
          Saved
        </p>
      )}

      <Button type="submit" disabled={disabled || pending} className="gap-2 self-start">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
