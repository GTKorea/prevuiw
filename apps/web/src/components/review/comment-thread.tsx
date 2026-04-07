"use client";

import { useState } from "react";
import type { Comment } from "@/shared/types";
import { useResolveComment, useToggleReaction, useCreateComment, useCommentStore } from "@/entities/comment";
import { Avatar, AvatarFallback, AvatarImage, Button, Badge, Textarea } from "@/shared/ui";
import { cn, formatRelativeTime } from "@/shared/lib";
import { Square, CheckSquare, MessageCircle, SmilePlus } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface CommentThreadProps {
  comment: Comment;
  index: number;
  versionId: string;
}

const REACTION_EMOJIS = ["\uD83D\uDC4D", "\uD83D\uDC4E", "\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83C\uDF89"];

export function CommentThread({
  comment,
  index,
  versionId,
}: CommentThreadProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { activeCommentId, setActiveComment } = useCommentStore();
  const { t } = useI18n();
  const resolveComment = useResolveComment(versionId);
  const toggleReaction = useToggleReaction();
  const createComment = useCreateComment(versionId);
  const isActive = activeCommentId === comment.id;

  const authorName =
    comment.author?.name || comment.reviewerName || "Anonymous";
  const authorInitial = authorName.charAt(0).toUpperCase();

  const handleReplySubmit = () => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;
    createComment.mutate({
      content: trimmed,
      posX: comment.posX,
      posY: comment.posY,
      viewport: comment.viewport,
      parentId: comment.id,
    });
    setReplyContent("");
    setShowReply(false);
  };

  return (
    <div
      className={cn(
        "border-b border-border p-3 cursor-pointer transition-colors",
        isActive ? "bg-accent/50" : "hover:bg-accent/30"
      )}
      onClick={() => setActiveComment(isActive ? null : comment.id)}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "flex items-center justify-center rounded-full text-white text-xs font-bold w-5 h-5",
              comment.isResolved ? "bg-green-500" : "bg-blue-500"
            )}
          >
            {index + 1}
          </span>
          <Avatar size="sm">
            {comment.author?.avatarUrl && (
              <AvatarImage src={comment.author.avatarUrl} />
            )}
            <AvatarFallback>{authorInitial}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{authorName}</span>
            {comment.reviewerName && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {t("review.reviewer")}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto shrink-0">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(
                comment.reactions.reduce(
                  (acc, r) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>
                )
              ).map(([emoji, count]) => (
                <button
                  key={emoji}
                  className="inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0.5 text-xs hover:bg-accent transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReaction.mutate({ commentId: comment.id, emoji });
                  }}
                >
                  {emoji} {count}
                </button>
              ))}
            </div>
          )}

          {/* Actions — matching SDK icons */}
          <div className="flex items-center gap-1 mt-2">
            {/* Resolve — checkbox style */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                resolveComment.mutate(comment.id);
              }}
            >
              {comment.isResolved ? (
                <CheckSquare className="size-3.5 text-green-500" />
              ) : (
                <Square className="size-3.5" />
              )}
              <span className={comment.isResolved ? "text-green-500" : ""}>
                {comment.isResolved ? t("review.reopen") : t("review.resolve")}
              </span>
            </Button>

            {/* Reply */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowReply(!showReply);
              }}
            >
              <MessageCircle className="size-3.5" style={{ transform: "rotate(-8deg)" }} />
              {comment.replies.length > 0 && (
                <span className="text-muted-foreground">{comment.replies.length}</span>
              )}
            </Button>

            {/* Emoji */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactions(!showReactions);
                }}
              >
                <SmilePlus className="size-3.5" style={{ transform: "rotate(-8deg)" }} />
              </Button>
              {showReactions && (
                <div className="absolute top-full right-0 mt-1 flex gap-0.5 rounded-md border border-border bg-popover p-1 shadow-md z-50">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      className="rounded p-1.5 hover:bg-accent text-base cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReaction.mutate({ commentId: comment.id, emoji });
                        setShowReactions(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex items-center gap-1.5">
                <Avatar size="sm">
                  {reply.author?.avatarUrl && (
                    <AvatarImage src={reply.author.avatarUrl} />
                  )}
                  <AvatarFallback>
                    {(reply.author?.name || reply.reviewerName || "A")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-xs">
                  {reply.author?.name || reply.reviewerName || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(reply.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-foreground/90 whitespace-pre-wrap break-words">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {showReply && (
        <div className="ml-8 mt-2" onClick={(e) => e.stopPropagation()}>
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={t("review.reply") + "..."}
            className="min-h-[60px] text-sm resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReplySubmit();
              if (e.key === "Escape") setShowReply(false);
            }}
          />
          <div className="flex justify-end gap-2 mt-1">
            <Button variant="ghost" size="xs" onClick={() => setShowReply(false)}>
              {t("review.cancel")}
            </Button>
            <Button size="xs" onClick={handleReplySubmit} disabled={!replyContent.trim() || createComment.isPending}>
              {t("review.send")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
