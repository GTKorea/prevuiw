"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateProject } from "@/hooks/use-projects";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { SDK_SNIPPET } from "@/lib/sdk-snippet";
import { Check, Copy } from "lucide-react";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const project = await createProject.mutateAsync(name.trim());
    const slug = (project as any).slug;
    setCreatedSlug(slug);
    setStep("success");
  };

  const handleCopy = () => copy(SDK_SNIPPET);

  const handleGoToProject = () => {
    setOpen(false);
    if (createdSlug) router.push(`/p/${createdSlug}`);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      if (step === "success" && createdSlug) {
        router.push(`/p/${createdSlug}`);
      }
      setName("");
      setStep("form");
      setCreatedSlug(null);
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
                  Add this script to your site
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  To leave comments at exact positions on your UI, add the following script tag to your site's {"<head>"}. It only activates inside prevuiw.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background px-2 py-1.5 text-[11px] text-foreground border border-border select-all break-all">
                    {SDK_SNIPPET}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 text-xs gap-1"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
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
