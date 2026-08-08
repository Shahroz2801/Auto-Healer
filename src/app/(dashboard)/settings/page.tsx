import { UserProfile } from "@clerk/nextjs";
import { requireDbUser } from "@/server/services/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrganizationForm } from "@/features/settings/organization-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireDbUser();
  const membership = user.memberships[0];
  const canEdit = membership?.role === "OWNER" || membership?.role === "ADMIN";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace and account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workspace</CardTitle>
            {membership && <Badge variant="outline">{membership.role}</Badge>}
          </div>
          <CardDescription>
            {canEdit
              ? "Update your workspace name and URL slug."
              : "Only workspace owners or admins can change these settings."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membership ? (
            <OrganizationForm
              defaultName={membership.organization.name}
              defaultSlug={membership.organization.slug}
              disabled={!canEdit}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No workspace found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Profile, email, password, and security are managed by Clerk.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center overflow-x-auto">
          <UserProfile
            routing="hash"
            appearance={{
              elements: { rootBox: "w-full", cardBox: "w-full shadow-none border-none" },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
