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
  const { setMode, setIframePageUrl, setIframeScroll, iframePageUrl } = useCommentStore();

  // Listen for page URL and scroll changes from proxied iframes
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "prevuiw:url" && typeof e.data.url === "string") {
        setIframePageUrl(e.data.url);
      }
      if (e.data?.type === "prevuiw:scroll") {
        setIframeScroll({
          scrollX: e.data.scrollX,
          scrollY: e.data.scrollY,
          scrollWidth: e.data.scrollWidth,
          scrollHeight: e.data.scrollHeight,
          clientWidth: e.data.clientWidth,
          clientHeight: e.data.clientHeight,
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      setIframePageUrl(null);
      setIframeScroll(null);
    };
  }, [setIframePageUrl, setIframeScroll]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [pendingCommentData, setPendingCommentData] = useState<{
    content: string;
    posX: number;
    posY: number;
    selectionArea?: { x: number; y: number; width: number; height: number };
    parentId?: string;
  } | null>(null);

  // Find the version in the project data
  const version = project?.versions.find((v) => v.id === versionId);

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

      <div className="flex flex-1 min-h-0">
        {/* Main content area */}
        <div className="flex-1 relative min-w-0">
          <CommentOverlay
            comments={comments}
            onCreateComment={handleCreateComment}
            isCreating={createComment.isPending}
          />
          <IframeContainer url={version.url} />
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
