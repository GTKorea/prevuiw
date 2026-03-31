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
            "absolute border-2 border-dashed rounded-sm",
            isResolved
              ? "border-green-500/60 bg-green-500/5"
              : "border-yellow-500/60 bg-yellow-500/5"
          )}
          data-area-x={selectionArea.x}
          data-area-y={selectionArea.y}
          data-area-w={selectionArea.width}
          data-area-h={selectionArea.height}
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
        data-doc-x={posX}
        data-doc-y={posY}
      >
        <button
          className={cn(
            "flex items-center justify-center rounded-full text-white text-xs font-bold shadow-lg transition-transform hover:scale-110 cursor-pointer",
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
