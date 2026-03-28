"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Version {
  id: string;
  versionName: string;
  _count: { comments: number };
}

interface Project {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: { versions: number };
  versions: Version[];
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects"),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<Project>("/projects", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.delete(`/projects/${slug}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}
