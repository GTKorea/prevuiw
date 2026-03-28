"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { createCommentSocket } from "@/lib/socket";

interface Author {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Reaction {
  id: string;
  emoji: string;
  user: { id: string; name: string };
}

export interface Comment {
  id: string;
  versionId: string;
  authorId: string | null;
  guestName: string | null;
  content: string;
  posX: number;
  posY: number;
  selectionArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  parentId: string | null;
  isResolved: boolean;
  createdAt: string;
  author: Author | null;
  replies: Comment[];
  reactions: Reaction[];
}

export function useComments(versionId: string) {
  return useQuery<Comment[]>({
    queryKey: ["comments", versionId],
    queryFn: () => api.get(`/versions/${versionId}/comments`),
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
      selectionArea?: { x: number; y: number; width: number; height: number };
      parentId?: string;
      guestName?: string;
    }) => api.post(`/versions/${versionId}/comments`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", versionId] }),
  });
}

export function useResolveComment(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.patch(`/versions/${versionId}/comments/${commentId}/resolve`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", versionId] }),
  });
}

export function useDeleteComment(versionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/versions/${versionId}/comments/${commentId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", versionId] }),
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      emoji,
    }: {
      commentId: string;
      emoji: string;
    }) => api.post(`/comments/${commentId}/reactions`, { emoji }),
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

    socket.on("newComment", () => {
      queryClient.invalidateQueries({ queryKey: ["comments", versionId] });
    });
    socket.on("resolveComment", () => {
      queryClient.invalidateQueries({ queryKey: ["comments", versionId] });
    });
    socket.on("deleteComment", () => {
      queryClient.invalidateQueries({ queryKey: ["comments", versionId] });
    });
    socket.on("onlineCount", (count: number) => setOnlineCount(count));

    return () => {
      socket.disconnect();
    };
  }, [versionId, queryClient]);

  return { onlineCount };
}
