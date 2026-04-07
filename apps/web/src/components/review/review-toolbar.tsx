"use client";

import { Button } from "@/shared/ui";
import { Badge } from "@/shared/ui";
import { cn } from "@/shared/lib";
import {
  ArrowLeft,
  PanelRight,
  Users,
  Link as LinkIcon,
  Check,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui";
import { useCopyToClipboard } from "@/shared/lib/use-copy-to-clipboard";

interface ReviewToolbarProps {
  projectName: string;
  projectSlug: string;
  versionName: string;
  commentCount: number;
  onlineCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  reviewUrl: string;
}

export function ReviewToolbar({
  projectName,
  projectSlug,
  versionName,
  commentCount,
  onlineCount,
  sidebarOpen,
  onToggleSidebar,
  reviewUrl,
}: ReviewToolbarProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <TooltipProvider>
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

        {/* Copy review link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => copy(reviewUrl)}
              className="cursor-pointer"
            >
              {copied ? <Check className="size-4" /> : <LinkIcon className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy review URL"}</TooltipContent>
        </Tooltip>

        {/* Sidebar toggle */}
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
