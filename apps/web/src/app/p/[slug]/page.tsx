"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProject, useGenerateKey } from "@/hooks/use-versions";
import { VersionList } from "@/components/version/version-list";
import { CreateVersionDialog } from "@/components/version/create-version-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3012";

function SdkSetupSection({ projectId, publishableKey }: { projectId: string; publishableKey: string | null }) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const generateKey = useGenerateKey(projectId);
  const { copied: keyCopied, copy: copyKey } = useCopyToClipboard();
  const { copied: snippetCopied, copy: copySnippet } = useCopyToClipboard();

  const scriptSnippet = publishableKey
    ? `<script src="${API_URL}/sdk.js" data-key="${publishableKey}" data-api="${API_URL}"></script>`
    : null;

  const maskedKey = publishableKey
    ? `${publishableKey.slice(0, 7)}...${publishableKey.slice(-4)}`
    : null;

  const handleGenerate = async () => {
    await generateKey.mutateAsync();
  };

  return (
    <div className="border rounded-lg mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">SDK Setup</span>
        <span className="text-muted-foreground text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          {/* Publishable Key */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Publishable Key
            </label>
            {publishableKey ? (
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                  {revealed ? publishableKey : maskedKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevealed(!revealed)}
                >
                  {revealed ? "Hide" : "Reveal"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyKey(publishableKey)}
                >
                  {keyCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No key generated yet.</p>
            )}
            <div className="mt-2">
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={generateKey.isPending}
              >
                {generateKey.isPending
                  ? "Generating..."
                  : publishableKey
                    ? "Regenerate Key"
                    : "Generate Key"}
              </Button>
            </div>
          </div>

          {/* Script Snippet */}
          {scriptSnippet && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Script Tag
              </label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                {"Add this to your site's <head> to enable scroll and URL tracking in prevuiw."}
              </p>
              <div className="relative">
                <pre className="bg-muted px-3 py-2 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {scriptSnippet}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => copySnippet(scriptSnippet)}
                >
                  {snippetCopied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VersionHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: project, isLoading } = useProject(slug);
  const { user } = useAuth();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!project) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Project not found</p></div>;

  const isOwner = user?.id === project.owner?.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">←</Link>
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <span className="text-muted-foreground text-sm">— Version History</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{project.versions.length} version{project.versions.length !== 1 ? "s" : ""}</p>
          {isOwner && <CreateVersionDialog projectId={project.id} />}
        </div>

        {project.versions.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No versions yet. Add your first version to get started!</p>
        ) : (
          <VersionList versions={project.versions} projectSlug={slug} />
        )}

        {isOwner && (
          <SdkSetupSection
            projectId={project.id}
            publishableKey={project.publishableKey}
          />
        )}
      </div>
    </div>
  );
}
