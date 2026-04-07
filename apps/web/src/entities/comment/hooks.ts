"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api, queryKeys } from "@/shared/api";
import { createCommentSocket } from "@/shared/api/socket";
import type { Comment, Viewport } from "@/shared/types";

export function useComments(versionId: string, viewport?: Viewport) {
  const params = viewport ? `?viewport=${viewport}` : "";
  return useQuery<Comment[]>({
    queryKey: viewport
      ? queryKeys.comments.byViewport(versionId, viewport)
      : queryKeys.comments.all(versionId),
    queryFn: () => api.get(`/versions/${versionId}/comments${params}`),
    enabled: !!versionId,
  });
}

export function useCreateComment(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      content: string;
      posX: number;
      posY: number;
      viewport: Viewport;
      pageUrl?: string;
      cssSelector?: string;
      parentId?: string;
      reviewerName?: string;
    }) => api.post(`/versions/${versionId}/comments`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(versionId) }),
  });
}

export function useResolveComment(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.patch(`/versions/${versionId}/comments/${commentId}/resolve`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(versionId) }),
  });
}

export function useDeleteComment(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/versions/${versionId}/comments/${commentId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(versionId) }),
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      api.post(`/comments/${commentId}/reactions`, { emoji }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function useCommentSocket(versionId: string) {
  const queryClient = useQueryClient();
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef<ReturnType<typeof createCommentSocket> | null>(null);

  useEffect(() => {
    if (!versionId) return;
    const socket = createCommentSocket(versionId);
    socketRef.current = socket;

    socket.on("newComment", () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(versionId) })
    );
    socket.on("resolveComment", () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(versionId) })
    );
    socket.on("deleteComment", () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(versionId) })
    );
    socket.on("onlineCount", (count: number) => setOnlineCount(count));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [versionId, queryClient]);

  return { onlineCount, socketRef };
}
