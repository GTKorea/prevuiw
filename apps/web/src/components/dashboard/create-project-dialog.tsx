"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button, Input } from "@/shared/ui";
import { useCreateProject } from "@/entities/project";
import { useCopyToClipboard } from "@/shared/lib/use-copy-to-clipboard";
import { Check, Copy } from "lucide-react";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [createdProject, setCreatedProject] = useState<{ slug: string; publishableKey: string } | null>(null);
  const { copied, copy } = useCopyToClipboard();
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const project = await createProject.mutateAsync(name.trim());
    setCreatedProject({
      slug: (project as any).slug,
      publishableKey: (project as any).publishableKey,
    });
    setStep("success");
  };

  const sdkSnippet = createdProject
    ? `<script src="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3012'}/sdk.js" data-key="${createdProject.publishableKey}" data-api="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3012'}"></script>`
    : "";

  const handleGoToProject = () => {
    setOpen(false);
    if (createdProject) router.push(`/p/${createdProject.slug}`);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      if (step === "success" && createdProject) {
        router.push(`/p/${createdProject.slug}`);
      }
      setName("");
      setStep("form");
      setCreatedProject(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ New Project</Button>
      </DialogTrigger>
      <DialogContent>
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Project Created!</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="rounded-md border border-border bg-muted/50 p-3 text-xs space-y-2">
                <p className="font-medium text-foreground">
                  1. Add this SDK script to your site's {"<head>"}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background px-2 py-1.5 text-[11px] text-foreground border border-border select-all break-all">
                    {sdkSnippet}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 text-xs gap-1"
                    onClick={() => copy(sdkSnippet)}
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/50 p-3 text-xs space-y-1">
                <p className="font-medium text-foreground">2. Deploy your site</p>
                <p className="text-muted-foreground">
                  Once deployed, create a version with your domain to start reviewing.
                </p>
              </div>
              <Button onClick={handleGoToProject}>
                Go to Project
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
