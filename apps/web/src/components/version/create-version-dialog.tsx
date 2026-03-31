"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVersion } from "@/hooks/use-versions";

export function CreateVersionDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");
  const createVersion = useCreateVersion(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVersion.mutateAsync({ versionName, url, memo: memo || undefined });
    setOpen(false);
    setVersionName("");
    setUrl("");
    setMemo("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Version</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add New Version</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input placeholder="Version name (e.g. v2.0)" value={versionName} onChange={(e) => setVersionName(e.target.value)} required />
          <Input type="url" placeholder="https://your-app.vercel.app" value={url} onChange={(e) => setUrl(e.target.value)} required />
          <Textarea placeholder="Version memo (optional)" value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} />

          <Button type="submit" disabled={createVersion.isPending}>
            {createVersion.isPending ? "Creating..." : "Create Version"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
