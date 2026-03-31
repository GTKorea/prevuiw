"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { useProject } from "@/hooks/use-versions";
import { SDK_SNIPPET } from "@/lib/sdk-snippet";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
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
import { CursorOverlay } from "@/components/review/cursor-overlay";
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
  const { onlineCount, socketRef } = useCommentSocket(versionId);
  const { setMode, setIframePageUrl, iframePageUrl, setSdkDetected } = useCommentStore();
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Listen for page URL changes and SDK handshake
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "prevuiw:ping" && e.source) {
        (e.source as Window).postMessage({ type: "prevuiw:pong" }, "*");
        setSdkDetected(true);
      }
      if (e.data?.type === "prevuiw:url" && typeof e.data.url === "string") {
        setIframePageUrl(e.data.url);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      setIframePageUrl(null);
      setSdkDetected(false);
    };
  }, [setIframePageUrl, setSdkDetected]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [proxyFailed, setProxyFailed] = useState(false);
  const [sdkCheckDone, setSdkCheckDone] = useState(false);
  const { copied: sdkCopied, copy: copySdk } = useCopyToClipboard();

  // Wait 3s for SDK handshake before marking check as done
  const sdkDetected = useCommentStore((s) => s.sdkDetected);
  useEffect(() => {
    if (sdkDetected) {
      setSdkCheckDone(true);
      return;
    }
    const timer = setTimeout(() => setSdkCheckDone(true), 3000);
    return () => clearTimeout(timer);
  }, [sdkDetected]);
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
  // MUTABLE URLs load directly (preserving origin for JS/API calls).
  const isImmutable = version?.urlType === "IMMUTABLE";
  const hasScreenshots = version && version.screenshots.length > 0;
  const sdkMissing = !isImmutable && sdkCheckDone && !sdkDetected;

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

  const showScreenshotFallback = isImmutable && proxyFailed && hasScreenshots;
  const showProxyIframe = isImmutable && !proxyFailed;
  const showProxyFailedNoScreenshots = isImmutable && proxyFailed && !hasScreenshots;

  const cursorUserName = user?.name || getGuestName() || "Anonymous";

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
        disabled={sdkMissing}
      />

      {/* SDK missing banner — MUTABLE sites without SDK */}
      {sdkMissing && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border-b border-orange-500/20 text-xs text-orange-600 dark:text-orange-400">
          <AlertCircle className="size-4 shrink-0" />
          <span>To leave comments, add the prevuiw SDK script to your site's {"<head>"}.</span>
          <button
            className="shrink-0 rounded border border-border bg-background px-2 py-0.5 text-[11px] font-medium hover:bg-muted transition-colors"
            onClick={() => copySdk(SDK_SNIPPET)}
          >
            {sdkCopied ? <Check className="inline size-3" /> : <Copy className="inline size-3" />}
            {sdkCopied ? " Copied!" : " Copy SDK snippet"}
          </button>
        </div>
      )}

      {/* Fallback notification banner */}
      {showScreenshotFallback && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            This site blocks direct embedding. Showing static screenshots — interactions (clicks, scroll) are not available.
          </span>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Main content area */}
        <div className="flex-1 relative min-w-0" ref={contentAreaRef}>
          <CursorOverlay
            socketRef={socketRef}
            userName={cursorUserName}
            trackRef={contentAreaRef}
          />
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
                <AlertCircle className="size-6 text-muted-foreground" />
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
