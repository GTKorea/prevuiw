"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommentStore } from "@/stores/comment-store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  MessageCircle,
  MousePointer2,
  PanelRight,
  Users,
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
  disabled?: boolean;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const modKey = isMac ? "\u2318" : "Ctrl";

export function ReviewToolbar({
  projectName,
  projectSlug,
  versionName,
  commentCount,
  onlineCount,
  sidebarOpen,
  onToggleSidebar,
  disabled,
}: ReviewToolbarProps) {
  const { mode, setMode, pinsVisible, setPinsVisible } = useCommentStore();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <TooltipProvider>
      {/* Top header — project name only */}
      <div className="h-12 border-b border-border bg-background flex items-center px-3 gap-2 shrink-0 relative z-20">
        <Link
          href={`/p/${projectSlug}`}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

        <div className="flex-1" />

        {/* Online users */}
        {onlineCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-4" />
            <span>{onlineCount}</span>
          </div>
        )}

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={handleCopyLink} className="cursor-pointer">
              <LinkIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy link</TooltipContent>
        </Tooltip>
      </div>

      {/* Floating bottom toolbar — Figma style */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-xl border border-border bg-background/95 backdrop-blur-sm shadow-lg px-2 py-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === "idle" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("idle")}
              disabled={disabled}
              className="cursor-pointer gap-1.5"
            >
              <MousePointer2 className="size-4" />
              <span className="text-xs hidden sm:inline">Browse</span>
              <kbd className="text-[10px] text-muted-foreground ml-0.5 hidden sm:inline">V</kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Browse mode (V)</TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === "commenting" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("commenting")}
              disabled={disabled}
              className="cursor-pointer gap-1.5"
            >
              <MessageCircle className="size-4" />
              <span className="text-xs hidden sm:inline">Comment</span>
              <kbd className="text-[10px] text-muted-foreground ml-0.5 hidden sm:inline">{modKey}</kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Click or drag to comment ({modKey})</TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={pinsVisible ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setPinsVisible(!pinsVisible)}
              className="cursor-pointer"
            >
              {pinsVisible ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {pinsVisible ? "Hide pins" : "Show pins"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sidebarOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={onToggleSidebar}
              className="cursor-pointer gap-1"
            >
              <PanelRight className="size-4" />
              <span className="text-xs">{commentCount}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle comments</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
