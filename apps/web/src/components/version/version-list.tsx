"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Version {
  id: string;
  versionName: string;
  url: string;
  memo: string | null;
  urlType: "IMMUTABLE" | "MUTABLE";
  isActive: boolean;
  createdAt: string;
  _count: { comments: number };
  screenshots: { id: string }[];
}

interface VersionListProps {
  versions: Version[];
  projectSlug: string;
}

export function VersionList({ versions, projectSlug }: VersionListProps) {
  return (
    <div className="flex flex-col gap-2">
      {versions.map((version) => (
        <div
          key={version.id}
          className={`flex items-center rounded-lg border p-3 px-4 gap-4 ${
            version.isActive ? "border-blue-500/50 bg-blue-500/5" : "border-border"
          }`}
        >
          {version.isActive ? (
            <Badge className="bg-blue-500/20 text-blue-400 border-0">LIVE</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">{version.versionName}</Badge>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">
              {version.versionName}{version.memo ? ` — ${version.memo}` : ""}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {new Date(version.createdAt).toLocaleDateString()} · {version.url.replace(/^https?:\/\//, "")} · {version.urlType.toLowerCase()}
              {version.urlType === "MUTABLE" && !version.isActive && version.screenshots.length === 0 && " · 📸 screenshots only"}
            </div>
          </div>

          <span className="text-xs text-muted-foreground">💬 {version._count.comments}</span>

          <Link href={`/p/${projectSlug}/${version.id}`}>
            <Button variant="secondary" size="sm">
              {version.isActive ? "Open" : "View"}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
