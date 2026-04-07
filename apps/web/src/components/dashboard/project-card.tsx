"use client";
import Link from "next/link";
import { Card, CardContent, Badge } from "@/shared/ui";
import { cn } from "@/shared/lib";

interface ProjectCardProps {
  name: string;
  slug: string;
  versionCount: number;
  sdkConnected: boolean;
  latestVersion?: { versionName: string; _count: { comments: number } };
}

export function ProjectCard({ name, slug, versionCount, sdkConnected, latestVersion }: ProjectCardProps) {
  return (
    <Link href={`/p/${slug}`}>
      <Card className={cn(
        "hover:border-foreground/20 transition-all cursor-pointer",
        sdkConnected && "border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.15)]"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{name}</span>
              {sdkConnected ? (
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">Not connected</span>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {versionCount} version{versionCount !== 1 ? "s" : ""}
            </Badge>
          </div>
          {latestVersion && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Latest: {latestVersion.versionName}</span>
              <span>{latestVersion._count.comments} comments</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
