"use client";
import { create } from "zustand";
import type { Viewport } from "@/shared/types";

type CommentMode = "idle" | "commenting";

interface CommentState {
  mode: CommentMode;
  activeCommentId: string | null;
  pinsVisible: boolean;
  viewport: Viewport;
  pageUrl: string | null;
  setMode: (mode: CommentMode) => void;
  setActiveComment: (id: string | null) => void;
  setPinsVisible: (visible: boolean) => void;
  setViewport: (viewport: Viewport) => void;
  setPageUrl: (url: string | null) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  mode: "idle",
  activeCommentId: null,
  pinsVisible: true,
  viewport: "DESKTOP_1920",
  pageUrl: null,
  setMode: (mode) => set({ mode }),
  setActiveComment: (activeCommentId) => set({ activeCommentId }),
  setPinsVisible: (pinsVisible) => set({ pinsVisible }),
  setViewport: (viewport) => set({ viewport }),
  setPageUrl: (pageUrl) => set({ pageUrl }),
}));
