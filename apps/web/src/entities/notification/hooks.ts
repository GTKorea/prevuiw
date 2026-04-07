"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/shared/api";
import type { Notification } from "@/shared/types";

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: queryKeys.notifications.all(),
    queryFn: () => api.get("/notifications"),
    refetchInterval: 30000,
  });
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => api.get("/notifications/unread-count"),
    refetchInterval: 30000,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() }),
  });
}
