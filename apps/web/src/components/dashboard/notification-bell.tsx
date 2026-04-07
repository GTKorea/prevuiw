"use client";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Popover, PopoverContent, PopoverTrigger, ScrollArea } from "@/shared/ui";
import { useNotifications, useUnreadCount, useMarkAllRead } from "@/entities/notification";
import { cn, formatRelativeTime } from "@/shared/lib";

function typeLabel(type: "MENTION" | "REPLY" | "RESOLVE") {
  if (type === "MENTION") return "mentioned you";
  if (type === "REPLY") return "replied";
  if (type === "RESOLVE") return "resolved a comment";
  return "";
}

export function NotificationBell() {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAllRead = useMarkAllRead();

  const count = unreadCount ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Bell className="h-6 w-6 opacity-40" />
            <span>No notifications yet</span>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <ul>
              {notifications.map((n) => {
                const author = n.comment.author?.name ?? n.comment.reviewerName ?? "Someone";
                const project = n.comment.version.project;
                const versionId = n.comment.version.id;
                const href = `/p/${project.slug}?version=${versionId}`;

                return (
                  <li key={n.id}>
                    <button
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                        !n.isRead && "bg-muted/30"
                      )}
                      onClick={() => router.push(href)}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                        <div className={cn("flex-1 space-y-0.5", n.isRead && "pl-4")}>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{author}</span>{" "}
                            {typeLabel(n.type)} in{" "}
                            <span className="font-medium text-foreground">{project.name}</span>
                          </p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {n.comment.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
