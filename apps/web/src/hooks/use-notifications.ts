"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  type: "MENTION" | "REPLY" | "RESOLVE";
  isRead: boolean;
  createdAt: string;
  comment: {
    content: string;
    author: { name: string; avatarUrl: string | null } | null;
    guestName: string | null;
    version: { id: string; versionName: string; project: { name: string; slug: string } };
  };
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications"),
    refetchInterval: 30000, // poll every 30s
  });
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ["notifications", "unread"],
    queryFn: () => api.get("/notifications/unread-count"),
    refetchInterval: 30000,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
