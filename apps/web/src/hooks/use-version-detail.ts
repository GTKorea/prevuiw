"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Screenshot {
  id: string;
  viewport: string;
  imageUrl: string;
}

interface VersionOwner {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface VersionProject {
  id: string;
  name: string;
  slug: string;
  owner: VersionOwner;
}

export interface VersionDetail {
  id: string;
  versionName: string;
  url: string;
  memo: string | null;
  urlType: "IMMUTABLE" | "MUTABLE";
  isActive: boolean;
  createdAt: string;
  _count: { comments: number };
  screenshots: Screenshot[];
  project: VersionProject;
}

export function useVersionDetail(projectId: string, versionId: string) {
  return useQuery<VersionDetail>({
    queryKey: ["version", projectId, versionId],
    queryFn: () => api.get(`/projects/${projectId}/versions/${versionId}`),
    enabled: !!projectId && !!versionId,
  });
}
