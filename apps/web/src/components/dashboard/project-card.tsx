"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  name: string;
  slug: string;
  versionCount: number;
  latestVersion?: { versionName: string; _count: { comments: number } };
}

export function ProjectCard({ name, slug, versionCount, latestVersion }: ProjectCardProps) {
  return (
    <Link href={`/p/${slug}`}>
      <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">{name}</span>
            <Badge variant="secondary" className="text-xs">
              {versionCount} version{versionCount !== 1 ? "s" : ""}
            </Badge>
          </div>
          {latestVersion && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Latest: {latestVersion.versionName}</span>
              <span>💬 {latestVersion._count.comments}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
