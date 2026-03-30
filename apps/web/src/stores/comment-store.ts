"use client";
import { create } from "zustand";

type CommentMode = "idle" | "placing" | "dragging";

interface CommentState {
  mode: CommentMode;
  activeCommentId: string | null;
  pinsVisible: boolean;
  iframePageUrl: string | null;
  setMode: (mode: CommentMode) => void;
  setActiveComment: (id: string | null) => void;
  setPinsVisible: (visible: boolean) => void;
  setIframePageUrl: (url: string | null) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  mode: "idle",
  activeCommentId: null,
  pinsVisible: true,
  iframePageUrl: null,
  setMode: (mode) => set({ mode }),
  setActiveComment: (activeCommentId) => set({ activeCommentId }),
  setPinsVisible: (pinsVisible) => set({ pinsVisible }),
  setIframePageUrl: (iframePageUrl) => set({ iframePageUrl }),
}));
