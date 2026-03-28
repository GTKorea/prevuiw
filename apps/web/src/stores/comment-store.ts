"use client";
import { create } from "zustand";

type CommentMode = "idle" | "placing" | "dragging";

interface CommentState {
  mode: CommentMode;
  activeCommentId: string | null;
  setMode: (mode: CommentMode) => void;
  setActiveComment: (id: string | null) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  mode: "idle",
  activeCommentId: null,
  setMode: (mode) => set({ mode }),
  setActiveComment: (activeCommentId) => set({ activeCommentId }),
}));
