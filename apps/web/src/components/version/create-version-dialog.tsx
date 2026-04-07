"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button, Input, Textarea } from "@/shared/ui";
import { useCreateVersion } from "@/entities/project";
import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/shared/lib/use-copy-to-clipboard";
import { useI18n } from "@/i18n/context";

export function CreateVersionDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [domain, setDomain] = useState("");
  const [memo, setMemo] = useState("");
  const [createdVersion, setCreatedVersion] = useState<{
    versionKey: string;
    inviteToken: string;
    domain: string;
  } | null>(null);
  const createVersion = useCreateVersion(projectId);
  const { copied, copy } = useCopyToClipboard();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result: any = await createVersion.mutateAsync({
      versionName,
      domain,
      memo: memo || undefined,
    });
    setCreatedVersion({
      versionKey: result.versionKey,
      inviteToken: result.inviteToken,
      domain: result.domain,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setVersionName("");
    setDomain("");
    setMemo("");
    setCreatedVersion(null);
  };

  const reviewUrl = createdVersion
    ? `${createdVersion.domain}?prevuiw=${createdVersion.versionKey}&token=${createdVersion.inviteToken}`
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button>{t("version.newVersion")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {createdVersion ? t("version.createdTitle") : t("version.addTitle")}
          </DialogTitle>
        </DialogHeader>

        {createdVersion ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t("version.shareUrl")}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-mono text-foreground break-all">{reviewUrl}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copy(reviewUrl)}
                  className="shrink-0"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleClose}>{t("version.done")}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder={t("version.versionName")}
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              required
            />
            <Input
              placeholder={t("version.domainPlaceholder")}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
            <Textarea
              placeholder={t("version.memo")}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
            />
            <Button type="submit" disabled={createVersion.isPending}>
              {createVersion.isPending ? t("version.creating") : t("version.create")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
