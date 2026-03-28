"use client";

import { useState } from "react";
import { Comment } from "@/hooks/use-comments";
import { CommentThread } from "./comment-thread";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type FilterTab = "all" | "open" | "resolved";

interface CommentSidebarProps {
  comments: Comment[];
  versionId: string;
  onReply: (parentId: string, content: string) => void;
  isReplyLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentSidebar({
  comments,
  versionId,
  onReply,
  isReplyLoading,
  isOpen,
  onClose,
}: CommentSidebarProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

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
          Comments ({topLevelComments.length})
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-border">
        {(
          [
            { key: "all", label: "All", count: topLevelComments.length },
            { key: "open", label: "Open", count: openCount },
            { key: "resolved", label: "Resolved", count: resolvedCount },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors border-b-2",
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
      <ScrollArea className="flex-1">
        {filteredComments.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No comments yet
          </div>
        ) : (
          filteredComments.map((comment, i) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              index={topLevelComments.indexOf(comment)}
              versionId={versionId}
              onReply={onReply}
              isReplyLoading={isReplyLoading}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
