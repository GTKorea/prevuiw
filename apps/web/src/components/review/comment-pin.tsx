"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCommentStore } from "@/stores/comment-store";

interface CommentPinProps {
  id: string;
  index: number;
  posX: number;
  posY: number;
  isResolved: boolean;
  content: string;
  authorName: string;
  selectionArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export function CommentPin({
  id,
  index,
  posX,
  posY,
  isResolved,
  content,
  authorName,
  selectionArea,
}: CommentPinProps) {
  const { activeCommentId, setActiveComment } = useCommentStore();
  const isActive = activeCommentId === id;
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {selectionArea && (
        <div
          className={cn(
            "absolute border-2 rounded-sm",
            isResolved
              ? "border-green-500/40 bg-green-500/10"
              : "border-yellow-500/40 bg-yellow-500/10"
          )}
          style={{
            left: `${selectionArea.x}%`,
            top: `${selectionArea.y}%`,
            width: `${selectionArea.width}%`,
            height: `${selectionArea.height}%`,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        className="absolute z-10"
        style={{
          left: `${posX}%`,
          top: `${posY}%`,
          pointerEvents: "auto",
        }}
      >
        <button
          className={cn(
            "flex items-center justify-center rounded-full text-white text-xs font-bold shadow-lg transition-transform hover:scale-110",
            "w-6 h-6 -translate-x-1/2 -translate-y-1/2",
            isResolved ? "bg-green-500" : "bg-blue-500",
            isActive && "ring-2 ring-white scale-125"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setActiveComment(isActive ? null : id);
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {index + 1}
        </button>
        {/* Hover preview popover */}
        {hovered && !isActive && (
          <div
            className="absolute left-1/2 top-full mt-1 -translate-x-1/2 w-52 z-20"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="rounded-lg border border-border bg-popover p-2.5 shadow-lg text-xs">
              <p className="font-medium text-foreground mb-0.5 truncate">
                {authorName}
              </p>
              <p className="text-muted-foreground line-clamp-3">{content}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
