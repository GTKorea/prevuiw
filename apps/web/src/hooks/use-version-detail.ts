"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Version } from "@/shared/types";

interface VersionWithProject extends Version {
  project: {
    id: string;
    name: string;
    slug: string;
    owner: { id: string; name: string; avatarUrl: string | null };
  };
}

export function useVersionDetail(projectId: string, versionId: string) {
  return useQuery<VersionWithProject>({
    queryKey: ["version", projectId, versionId],
    queryFn: () => api.get(`/projects/${projectId}/versions/${versionId}`),
    enabled: !!projectId && !!versionId,
  });
}
