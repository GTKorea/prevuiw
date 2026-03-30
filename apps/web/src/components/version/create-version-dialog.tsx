"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVersion } from "@/hooks/use-versions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012";
const SDK_SNIPPET = `<script src="${API_URL}/sdk.js" defer></script>`;

export function CreateVersionDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);
  const createVersion = useCreateVersion(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVersion.mutateAsync({ versionName, url, memo: memo || undefined });
    setOpen(false);
    setVersionName("");
    setUrl("");
    setMemo("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SDK_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Version</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Version</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input placeholder="Version name (e.g. v2.0)" value={versionName} onChange={(e) => setVersionName(e.target.value)} required />
          <Input type="url" placeholder="https://your-app.vercel.app" value={url} onChange={(e) => setUrl(e.target.value)} required />
          <Textarea placeholder="Version memo (optional)" value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} />

          {/* SDK install guide */}
          <div className="rounded-md border border-border bg-muted/50 p-3 text-xs space-y-2">
            <p className="font-medium text-foreground">
              Scroll tracking SDK (optional)
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Add this script to your site&apos;s <code className="text-foreground">&lt;head&gt;</code> to enable scroll-aware comment pins and page navigation tracking.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-background px-2 py-1.5 text-[11px] text-foreground border border-border break-all select-all">
                {SDK_SNIPPET}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-7 text-xs"
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={createVersion.isPending}>
            {createVersion.isPending ? "Creating..." : "Create Version"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
