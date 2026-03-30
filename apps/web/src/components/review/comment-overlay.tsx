"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Comment } from "@/hooks/use-comments";
import { useCommentStore, IframeScroll } from "@/stores/comment-store";
import { CommentPin } from "./comment-pin";
import { CommentInput } from "./comment-input";
import { cn } from "@/lib/utils";

/** Convert viewport-relative % to document-relative % using iframe scroll info */
function viewportToDoc(
  vx: number,
  vy: number,
  s: IframeScroll
): { x: number; y: number } {
  const docX = (vx / 100) * s.clientWidth + s.scrollX;
  const docY = (vy / 100) * s.clientHeight + s.scrollY;
  return {
    x: (docX / s.scrollWidth) * 100,
    y: (docY / s.scrollHeight) * 100,
  };
}

/** Convert document-relative % back to viewport-relative % */
function docToViewport(
  dx: number,
  dy: number,
  s: IframeScroll
): { x: number; y: number } {
  const docX = (dx / 100) * s.scrollWidth;
  const docY = (dy / 100) * s.scrollHeight;
  return {
    x: ((docX - s.scrollX) / s.clientWidth) * 100,
    y: ((docY - s.scrollY) / s.clientHeight) * 100,
  };
}

function isInViewport(vx: number, vy: number): boolean {
  return vx >= -5 && vx <= 105 && vy >= -5 && vy <= 105;
}

interface PendingComment {
  /** Viewport-relative % (for rendering the input popover) */
  viewX: number;
  viewY: number;
  /** Document-relative % (for saving) */
  posX: number;
  posY: number;
  selectionArea?: { x: number; y: number; width: number; height: number };
}

interface CommentOverlayProps {
  comments: Comment[];
  onCreateComment: (data: {
    content: string;
    posX: number;
    posY: number;
    selectionArea?: { x: number; y: number; width: number; height: number };
    pageUrl?: string;
  }) => void;
  isCreating?: boolean;
}

export function CommentOverlay({
  comments,
  onCreateComment,
  isCreating,
}: CommentOverlayProps) {
  const { mode, setMode, pinsVisible, iframePageUrl, iframeScroll } =
    useCommentStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<PendingComment | null>(null);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);

  /** Get click position as viewport-relative % of the overlay */
  const getPercentPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!overlayRef.current) return { x: 0, y: 0 };
      const rect = overlayRef.current.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      };
    },
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "placing") return;
      const vp = getPercentPosition(e.clientX, e.clientY);
      const doc = iframeScroll
        ? viewportToDoc(vp.x, vp.y, iframeScroll)
        : { x: vp.x, y: vp.y };
      setPending({ viewX: vp.x, viewY: vp.y, posX: doc.x, posY: doc.y });
    },
    [mode, getPercentPosition, iframeScroll]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "dragging") return;
      const pos = getPercentPosition(e.clientX, e.clientY);
      setDragStart(pos);
      setDragCurrent(pos);
    },
    [mode, getPercentPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "dragging" || !dragStart) return;
      const pos = getPercentPosition(e.clientX, e.clientY);
      setDragCurrent(pos);
    },
    [mode, dragStart, getPercentPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (mode !== "dragging" || !dragStart || !dragCurrent) return;

    const vx = Math.min(dragStart.x, dragCurrent.x);
    const vy = Math.min(dragStart.y, dragCurrent.y);
    const vw = Math.abs(dragCurrent.x - dragStart.x);
    const vh = Math.abs(dragCurrent.y - dragStart.y);

    if (vw > 1 && vh > 1) {
      const centerVx = vx + vw / 2;
      const centerVy = vy + vh / 2;

      if (iframeScroll) {
        const topLeft = viewportToDoc(vx, vy, iframeScroll);
        const bottomRight = viewportToDoc(vx + vw, vy + vh, iframeScroll);
        const center = viewportToDoc(centerVx, centerVy, iframeScroll);
        setPending({
          viewX: centerVx,
          viewY: centerVy,
          posX: center.x,
          posY: center.y,
          selectionArea: {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y,
          },
        });
      } else {
        setPending({
          viewX: centerVx,
          viewY: centerVy,
          posX: centerVx,
          posY: centerVy,
          selectionArea: { x: vx, y: vy, width: vw, height: vh },
        });
      }
    }

    setDragStart(null);
    setDragCurrent(null);
  }, [mode, dragStart, dragCurrent, iframeScroll]);

  const handleSubmitComment = (content: string) => {
    if (!pending) return;
    onCreateComment({
      content,
      posX: pending.posX,
      posY: pending.posY,
      selectionArea: pending.selectionArea,
      pageUrl: iframePageUrl ?? undefined,
    });
    setPending(null);
    setMode("idle");
  };

  // Filter top-level comments by current page URL
  const topLevelComments = comments.filter((c) => {
    if (c.parentId) return false;
    if (iframePageUrl && c.pageUrl) {
      return c.pageUrl === iframePageUrl;
    }
    return true;
  });

  // Convert stored doc-relative positions to current viewport positions
  const visibleComments = useMemo(() => {
    return topLevelComments
      .map((comment, i) => {
        let vpX = comment.posX;
        let vpY = comment.posY;
        let selArea = comment.selectionArea;

        if (iframeScroll) {
          const vp = docToViewport(comment.posX, comment.posY, iframeScroll);
          vpX = vp.x;
          vpY = vp.y;

          if (comment.selectionArea) {
            const sa = comment.selectionArea;
            const tl = docToViewport(sa.x, sa.y, iframeScroll);
            const br = docToViewport(
              sa.x + sa.width,
              sa.y + sa.height,
              iframeScroll
            );
            selArea = {
              x: tl.x,
              y: tl.y,
              width: br.x - tl.x,
              height: br.y - tl.y,
            };
          }
        }

        if (!isInViewport(vpX, vpY)) return null;

        return {
          ...comment,
          vpX,
          vpY,
          selArea,
          index: i,
        };
      })
      .filter(Boolean) as Array<
      Comment & {
        vpX: number;
        vpY: number;
        selArea: Comment["selectionArea"];
        index: number;
      }
    >;
  }, [topLevelComments, iframeScroll]);

  // Compute drag selection rectangle (viewport-relative)
  const dragRect =
    dragStart && dragCurrent
      ? {
          x: Math.min(dragStart.x, dragCurrent.x),
          y: Math.min(dragStart.y, dragCurrent.y),
          width: Math.abs(dragCurrent.x - dragStart.x),
          height: Math.abs(dragCurrent.y - dragStart.y),
        }
      : null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "absolute inset-0 z-10",
        mode === "idle" ? "pointer-events-none" : "cursor-crosshair"
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Existing comment pins */}
      {pinsVisible &&
        visibleComments.map((comment) => (
          <CommentPin
            key={comment.id}
            id={comment.id}
            index={comment.index}
            posX={comment.vpX}
            posY={comment.vpY}
            isResolved={comment.isResolved}
            content={comment.content}
            authorName={comment.author?.name ?? comment.guestName ?? "Guest"}
            selectionArea={comment.selArea}
          />
        ))}

      {/* Drag selection rectangle */}
      {dragRect && (
        <div
          className="absolute border-2 border-yellow-500/60 bg-yellow-500/15 rounded-sm"
          style={{
            left: `${dragRect.x}%`,
            top: `${dragRect.y}%`,
            width: `${dragRect.width}%`,
            height: `${dragRect.height}%`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Pending comment selection area */}
      {pending?.selectionArea && iframeScroll && (() => {
        const sa = pending.selectionArea!;
        const tl = docToViewport(sa.x, sa.y, iframeScroll);
        const br = docToViewport(sa.x + sa.width, sa.y + sa.height, iframeScroll);
        return (
          <div
            className="absolute border-2 border-yellow-500/60 bg-yellow-500/15 rounded-sm"
            style={{
              left: `${tl.x}%`,
              top: `${tl.y}%`,
              width: `${br.x - tl.x}%`,
              height: `${br.y - tl.y}%`,
              pointerEvents: "none",
            }}
          />
        );
      })()}
      {pending?.selectionArea && !iframeScroll && (
        <div
          className="absolute border-2 border-yellow-500/60 bg-yellow-500/15 rounded-sm"
          style={{
            left: `${pending.selectionArea.x}%`,
            top: `${pending.selectionArea.y}%`,
            width: `${pending.selectionArea.width}%`,
            height: `${pending.selectionArea.height}%`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Pending comment input popover */}
      {pending && (
        <div
          className="absolute z-20 w-64"
          style={{
            left: `${pending.viewX}%`,
            top: `${pending.viewY}%`,
            transform: "translate(-50%, 8px)",
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
            <CommentInput
              onSubmit={handleSubmitComment}
              onCancel={() => {
                setPending(null);
                setMode("idle");
              }}
              placeholder="Leave a comment..."
              autoFocus
              isLoading={isCreating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
