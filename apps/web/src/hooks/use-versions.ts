"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Screenshot {
  id: string;
  viewport: string;
  imageUrl: string;
}

interface Version {
  id: string;
  versionName: string;
  url: string;
  memo: string | null;
  urlType: "IMMUTABLE" | "MUTABLE";
  isActive: boolean;
  createdAt: string;
  _count: { comments: number };
  screenshots: Screenshot[];
}

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  owner: { id: string; name: string; avatarUrl: string | null };
  versions: Version[];
}

export function useProject(slug: string) {
  return useQuery<ProjectDetail>({
    queryKey: ["project", slug],
    queryFn: () => api.get(`/projects/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateVersion(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { versionName: string; url: string; memo?: string }) =>
      api.post(`/projects/${projectId}/versions`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project"] }),
  });
}
