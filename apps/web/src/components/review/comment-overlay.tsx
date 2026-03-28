"use client";

import { useCallback, useRef, useState } from "react";
import { Comment } from "@/hooks/use-comments";
import { useCommentStore } from "@/stores/comment-store";
import { CommentPin } from "./comment-pin";
import { CommentInput } from "./comment-input";
import { cn } from "@/lib/utils";

interface PendingComment {
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
  }) => void;
  isCreating?: boolean;
}

export function CommentOverlay({
  comments,
  onCreateComment,
  isCreating,
}: CommentOverlayProps) {
  const { mode, setMode } = useCommentStore();
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
      const pos = getPercentPosition(e.clientX, e.clientY);
      setPending({ posX: pos.x, posY: pos.y });
    },
    [mode, getPercentPosition]
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

    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    if (width > 1 && height > 1) {
      setPending({
        posX: x + width / 2,
        posY: y + height / 2,
        selectionArea: { x, y, width, height },
      });
    }

    setDragStart(null);
    setDragCurrent(null);
  }, [mode, dragStart, dragCurrent]);

  const handleSubmitComment = (content: string) => {
    if (!pending) return;
    onCreateComment({
      content,
      posX: pending.posX,
      posY: pending.posY,
      selectionArea: pending.selectionArea,
    });
    setPending(null);
    setMode("idle");
  };

  const topLevelComments = comments.filter((c) => !c.parentId);

  // Compute drag selection rectangle
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
      {topLevelComments.map((comment, i) => (
        <CommentPin
          key={comment.id}
          id={comment.id}
          index={i}
          posX={comment.posX}
          posY={comment.posY}
          isResolved={comment.isResolved}
          selectionArea={comment.selectionArea}
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
      {pending?.selectionArea && (
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
            left: `${pending.posX}%`,
            top: `${pending.posY}%`,
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
