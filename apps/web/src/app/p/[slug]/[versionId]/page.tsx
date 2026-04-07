"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { useProject } from "@/entities/project";
import { useComments, useCommentSocket, useCommentStore } from "@/entities/comment";
import { useCopyToClipboard } from "@/shared/lib/use-copy-to-clipboard";
import { cn } from "@/shared/lib";
import { VIEWPORT_CONFIG } from "@/shared/config/viewports";
import type { Viewport } from "@/shared/types";
import { ReviewToolbar } from "@/components/review/review-toolbar";
import { CommentSidebar } from "@/components/review/comment-sidebar";
import { ScreenshotViewer } from "@/components/review/screenshot-viewer";
import { useI18n } from "@/i18n/context";

export default function ReviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const versionId = params.versionId as string;

  const { data: project, isLoading: projectLoading } = useProject(slug);
  const { viewport, setViewport } = useCommentStore();
  const { data: comments = [] } = useComments(versionId, viewport);
  const { onlineCount } = useCommentSocket(versionId);
  const { copied: linkCopied, copy: copyLink } = useCopyToClipboard();
  const { t } = useI18n();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const version = project?.versions.find((v) => v.id === versionId);

  const topLevelComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );

  const screenshots = useMemo(
    () => version?.screenshots.filter((s) => s.viewport === viewport) ?? [],
    [version?.screenshots, viewport]
  );

  const reviewUrl = version
    ? `${version.domain}?prevuiw=${version.versionKey}&token=${version.inviteToken}`
    : "";

  if (projectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!project || !version) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("review.versionNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <ReviewToolbar
        projectName={project.name}
        projectSlug={slug}
        versionName={version.versionName}
        commentCount={topLevelComments.length}
        onlineCount={onlineCount}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        reviewUrl={reviewUrl}
      />

      {/* Viewport tabs + Review URL */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-1">
          {VIEWPORT_CONFIG.map((vp) => {
            const Icon = vp.icon;
            const isActive = viewport === vp.key;
            return (
              <button
                key={vp.key}
                onClick={() => setViewport(vp.key as Viewport)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="size-3.5" />
                {vp.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => copyLink(reviewUrl)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
        >
          {linkCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {linkCopied ? t("review.copied") : t("review.copyReviewUrl")}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative min-w-0 overflow-auto">
          {screenshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
              <div className="text-center max-w-md">
                <p className="text-sm font-medium text-foreground mb-1">
                  {t("review.noScreenshots")} {VIEWPORT_CONFIG.find(v => v.key === viewport)?.label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("review.screenshotHint")}
                </p>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-mono text-muted-foreground break-all">{reviewUrl}</p>
                </div>
              </div>
            </div>
          ) : (
            <ScreenshotViewer screenshots={screenshots} comments={topLevelComments} />
          )}
        </div>

        <CommentSidebar
          comments={comments}
          versionId={versionId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
