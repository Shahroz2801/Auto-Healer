"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProjectAction } from "@/features/projects/actions";
import { importMethods } from "@/lib/validators/project";

const urlLabels: Record<string, string> = {
  URL: "Website URL",
  GITHUB: "GitHub repository URL",
  GITLAB: "GitLab repository URL",
  BITBUCKET: "Bitbucket repository URL",
  WORDPRESS: "WordPress site URL",
  SHOPIFY: "Shopify store URL",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2 self-start">
      {pending && <Loader2 className="size-4 animate-spin" />}
      Create project
    </Button>
  );
}

export function NewProjectForm({ errorMessage }: { errorMessage?: string }) {
  const [importMethod, setImportMethod] = React.useState<string>("URL");
  const showSourceUrl = importMethod !== "ZIP_UPLOAD";

  return (
    <form action={createProjectAction} className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" placeholder="Marketing site" required maxLength={80} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="importMethod">Import method</Label>
        <Select
          name="importMethod"
          value={importMethod}
          onValueChange={(value) => setImportMethod(value as string)}
        >
          <SelectTrigger id="importMethod" className="w-full">
            <SelectValue placeholder="Select an import method" />
          </SelectTrigger>
          <SelectContent>
            {importMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showSourceUrl && (
        <div className="space-y-1.5">
          <Label htmlFor="sourceUrl">{urlLabels[importMethod] ?? "Source URL"}</Label>
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            placeholder="https://example.com"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What is this project for?"
          maxLength={280}
          rows={3}
        />
      </div>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      <SubmitButton />
    </form>
  );
}
