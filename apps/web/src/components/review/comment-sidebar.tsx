"use client";

import { useState } from "react";
import type { Comment } from "@/shared/types";
import { CommentThread } from "./comment-thread";
import { ScrollArea, Button } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { X } from "lucide-react";
import { useI18n } from "@/i18n/context";

type FilterTab = "all" | "open" | "resolved";

interface CommentSidebarProps {
  comments: Comment[];
  versionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentSidebar({
  comments,
  versionId,
  isOpen,
  onClose,
}: CommentSidebarProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const { t } = useI18n();

  const topLevelComments = comments.filter((c) => !c.parentId);

  const filteredComments = topLevelComments.filter((c) => {
    if (filter === "open") return !c.isResolved;
    if (filter === "resolved") return c.isResolved;
    return true;
  });

  const openCount = topLevelComments.filter((c) => !c.isResolved).length;
  const resolvedCount = topLevelComments.filter((c) => c.isResolved).length;

  if (!isOpen) return null;

  return (
    <div className="w-[300px] shrink-0 border-l border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-sm font-semibold">
          {t("review.comments")} ({topLevelComments.length})
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-border">
        {(
          [
            { key: "all", label: t("review.allComments"), count: topLevelComments.length },
            { key: "open", label: t("review.openComments"), count: openCount },
            { key: "resolved", label: t("review.resolvedComments"), count: resolvedCount },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors border-b-2 cursor-pointer",
              filter === key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setFilter(key)}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Comment list */}
      <ScrollArea className="flex-1 overflow-hidden">
        {filteredComments.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            {t("review.noComments")}
          </div>
        ) : (
          filteredComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              index={topLevelComments.indexOf(comment)}
              versionId={versionId}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
