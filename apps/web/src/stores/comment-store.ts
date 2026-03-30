"use client";
import { create } from "zustand";

type CommentMode = "idle" | "placing" | "dragging";

export interface IframeScroll {
  scrollX: number;
  scrollY: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}

interface CommentState {
  mode: CommentMode;
  activeCommentId: string | null;
  pinsVisible: boolean;
  iframePageUrl: string | null;
  iframeScroll: IframeScroll | null;
  setMode: (mode: CommentMode) => void;
  setActiveComment: (id: string | null) => void;
  setPinsVisible: (visible: boolean) => void;
  setIframePageUrl: (url: string | null) => void;
  setIframeScroll: (scroll: IframeScroll | null) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  mode: "idle",
  activeCommentId: null,
  pinsVisible: true,
  iframePageUrl: null,
  iframeScroll: null,
  setMode: (mode) => set({ mode }),
  setActiveComment: (activeCommentId) => set({ activeCommentId }),
  setPinsVisible: (pinsVisible) => set({ pinsVisible }),
  setIframePageUrl: (iframePageUrl) => set({ iframePageUrl }),
  setIframeScroll: (iframeScroll) => set({ iframeScroll }),
}));
