"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommentStore } from "@/stores/comment-store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MessageSquarePlus,
  MousePointer2,
  PanelRight,
  SquareDashedMousePointer,
  Users,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReviewToolbarProps {
  projectName: string;
  projectSlug: string;
  versionName: string;
  commentCount: number;
  onlineCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ReviewToolbar({
  projectName,
  projectSlug,
  versionName,
  commentCount,
  onlineCount,
  sidebarOpen,
  onToggleSidebar,
}: ReviewToolbarProps) {
  const { mode, setMode } = useCommentStore();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <TooltipProvider>
      <div className="h-12 border-b border-border bg-background flex items-center px-3 gap-2 shrink-0">
        {/* Back + project name */}
        <Link
          href={`/p/${projectSlug}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{projectName}</span>
          <span className="text-muted-foreground text-sm">/</span>
          <Badge variant="secondary" className="text-xs shrink-0">
            {versionName}
          </Badge>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Comment mode tools */}
        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "idle" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setMode("idle")}
              >
                <MousePointer2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Browse mode</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "placing" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setMode("placing")}
              >
                <MessageSquarePlus className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Point comment</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "dragging" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setMode("dragging")}
              >
                <SquareDashedMousePointer className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Area comment</TooltipContent>
          </Tooltip>
        </div>

        {/* Online users */}
        {onlineCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{onlineCount}</span>
          </div>
        )}

        {/* Comment count + sidebar toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sidebarOpen ? "secondary" : "ghost"}
              size="xs"
              onClick={onToggleSidebar}
              className="gap-1.5"
            >
              <PanelRight className="size-3.5" />
              <span className="text-xs">{commentCount}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle comments</TooltipContent>
        </Tooltip>

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={handleCopyLink}>
              <LinkIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy link</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
