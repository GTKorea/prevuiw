"use client";

import { cn } from "@/lib/utils";
import { useCommentStore } from "@/stores/comment-store";

interface CommentPinProps {
  id: string;
  index: number;
  posX: number;
  posY: number;
  isResolved: boolean;
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
  selectionArea,
}: CommentPinProps) {
  const { activeCommentId, setActiveComment } = useCommentStore();
  const isActive = activeCommentId === id;

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
      <button
        className={cn(
          "absolute z-10 flex items-center justify-center rounded-full text-white text-xs font-bold shadow-lg transition-transform hover:scale-110",
          "w-6 h-6 -translate-x-1/2 -translate-y-1/2",
          isResolved ? "bg-green-500" : "bg-blue-500",
          isActive && "ring-2 ring-white scale-125"
        )}
        style={{
          left: `${posX}%`,
          top: `${posY}%`,
          pointerEvents: "auto",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveComment(isActive ? null : id);
        }}
      >
        {index + 1}
      </button>
    </>
  );
}
