"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/shared/api";
import type { Project, ProjectDetail } from "@/shared/types";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: queryKeys.projects.all(),
    queryFn: () => api.get("/projects"),
  });
}

export function useProject(slug: string) {
  return useQuery<ProjectDetail>({
    queryKey: queryKeys.projects.detail(slug),
    queryFn: () => api.get(`/projects/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<Project>("/projects", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.delete(`/projects/${slug}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() }),
  });
}

export function useGenerateKey(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<{ id: string; publishableKey: string }>({
    mutationFn: () => api.post(`/projects/${projectId}/generate-key`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useCreateVersion(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { versionName: string; domain: string; memo?: string }) =>
      api.post(`/projects/${projectId}/versions`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}
