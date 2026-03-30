"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { useProject } from "@/hooks/use-versions";
import { useAuth } from "@/hooks/use-auth";
import {
  useComments,
  useCreateComment,
  useCommentSocket,
} from "@/hooks/use-comments";
import { useCommentStore } from "@/stores/comment-store";
import { ReviewToolbar } from "@/components/review/review-toolbar";
import { IframeContainer } from "@/components/review/iframe-container";
import { CommentOverlay } from "@/components/review/comment-overlay";
import { CommentSidebar } from "@/components/review/comment-sidebar";
import { ScreenshotViewer } from "@/components/review/screenshot-viewer";
import {
  GuestNameDialog,
  getGuestName,
} from "@/components/review/guest-name-dialog";

export default function ReviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const versionId = params.versionId as string;

  const { user } = useAuth();
  const { data: project, isLoading: projectLoading } = useProject(slug);
  const { data: comments = [], isLoading: commentsLoading } =
    useComments(versionId);
  const createComment = useCreateComment(versionId);
  const { onlineCount } = useCommentSocket(versionId);
  const { setMode, setIframePageUrl, iframePageUrl } = useCommentStore();

  // Listen for page URL changes from proxied iframes
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "prevuiw:url" && typeof e.data.url === "string") {
        setIframePageUrl(e.data.url);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      setIframePageUrl(null);
    };
  }, [setIframePageUrl]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [proxyFailed, setProxyFailed] = useState(false);
  const [pendingCommentData, setPendingCommentData] = useState<{
    content: string;
    posX: number;
    posY: number;
    selectionArea?: { x: number; y: number; width: number; height: number };
    parentId?: string;
  } | null>(null);

  // Find the version in the project data
  const version = project?.versions.find((v) => v.id === versionId);

  // IMMUTABLE URLs (Vercel, Netlify, etc.) block direct iframe embedding.
  // Strategy: proxy iframe (interactive) → screenshot fallback (static)
  const isImmutable = version?.urlType === "IMMUTABLE";
  const hasScreenshots = version && version.screenshots.length > 0;

  const submitComment = useCallback(
    (data: {
      content: string;
      posX: number;
      posY: number;
      selectionArea?: { x: number; y: number; width: number; height: number };
      pageUrl?: string;
      parentId?: string;
      guestName?: string;
    }) => {
      createComment.mutate({
        ...data,
        pageUrl: data.pageUrl ?? iframePageUrl ?? undefined,
      });
    },
    [createComment, iframePageUrl]
  );

  const handleCreateComment = useCallback(
    (data: {
      content: string;
      posX: number;
      posY: number;
      selectionArea?: { x: number; y: number; width: number; height: number };
      pageUrl?: string;
    }) => {
      if (!user) {
        const guestName = getGuestName();
        if (!guestName) {
          setPendingCommentData(data);
          setGuestDialogOpen(true);
          return;
        }
        submitComment({ ...data, guestName });
      } else {
        submitComment(data);
      }
    },
    [user, submitComment]
  );

  const handleReply = useCallback(
    (parentId: string, content: string) => {
      const parentComment = comments.find((c) => c.id === parentId);
      if (!parentComment) return;

      const data = {
        content,
        posX: parentComment.posX,
        posY: parentComment.posY,
        parentId,
      };

      if (!user) {
        const guestName = getGuestName();
        if (!guestName) {
          setPendingCommentData(data);
          setGuestDialogOpen(true);
          return;
        }
        submitComment({ ...data, guestName });
      } else {
        submitComment(data);
      }
    },
    [user, comments, submitComment]
  );

  const handleGuestNameSubmit = (name: string) => {
    setGuestDialogOpen(false);
    if (pendingCommentData) {
      submitComment({ ...pendingCommentData, guestName: name });
      setPendingCommentData(null);
    }
  };

  if (projectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!project || !version) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Version not found</p>
      </div>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parentId);

  // Determine what to render:
  // 1. IMMUTABLE + proxy failed + has screenshots → screenshot fallback
  // 2. IMMUTABLE + proxy not failed → proxy iframe (interactive)
  // 3. MUTABLE → direct iframe
  const showScreenshotFallback = isImmutable && proxyFailed && hasScreenshots;
  const showProxyIframe = isImmutable && !proxyFailed;
  const showProxyFailedNoScreenshots = isImmutable && proxyFailed && !hasScreenshots;

  return (
    <div className="flex flex-col h-screen bg-background">
      <ReviewToolbar
        projectName={project.name}
        projectSlug={slug}
        versionName={version.versionName}
        commentCount={topLevelComments.length}
        onlineCount={onlineCount}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Fallback notification banner */}
      {showScreenshotFallback && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>
            This site blocks direct embedding. Showing static screenshots — interactions (clicks, scroll) are not available.
          </span>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Main content area */}
        <div className="flex-1 relative min-w-0">
          {showScreenshotFallback ? (
            <>
              <CommentOverlay
                comments={comments}
                onCreateComment={handleCreateComment}
                isCreating={createComment.isPending}
              />
              <ScreenshotViewer screenshots={version.screenshots} />
            </>
          ) : showProxyFailedNoScreenshots ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="text-center max-w-md">
                <p className="text-sm font-medium text-foreground mb-1">
                  Unable to load this site
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This site has authentication protection (e.g. Vercel Deployment Protection) that prevents embedding. Try using a production URL or disabling deployment protection.
                </p>
              </div>
            </div>
          ) : (
            <>
              <CommentOverlay
                comments={comments}
                onCreateComment={handleCreateComment}
                isCreating={createComment.isPending}
              />
              <IframeContainer
                url={version.url}
                useProxy={showProxyIframe}
                onProxyError={() => setProxyFailed(true)}
              />
            </>
          )}
        </div>

        {/* Comment sidebar */}
        <CommentSidebar
          comments={comments}
          versionId={versionId}
          onReply={handleReply}
          isReplyLoading={createComment.isPending}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Guest name dialog */}
      <GuestNameDialog
        open={guestDialogOpen}
        onClose={() => {
          setGuestDialogOpen(false);
          setPendingCommentData(null);
        }}
        onSubmit={handleGuestNameSubmit}
      />
    </div>
  );
}
